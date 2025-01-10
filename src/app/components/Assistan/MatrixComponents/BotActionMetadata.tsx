import { ERC20__factory } from "abi-types";
import { chainIdAtom } from "app/atoms";
import Button from "app/components/elements/Button";
import PrettyAmount from "app/components/elements/PrettyAmount";
import { useAccounts, useLazyNetwork, useProvider } from "app/hooks";
import { ChatMatrixMessage, useChatMatrix } from "app/hooks/useChatMatrix";
import { withHumanDelay } from "app/utils";
import { ZERO_ADDRESSES } from "core/common";
import { AccountSource } from "core/types";
import { ethers } from "ethers";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useKyberSwap } from "app/hooks/kyberSwap";
// import { IconButton } from "packages/lifi-widget/components/ReverseTokensButton/ReverseTokensButton.style";
// import { DrawerButtonText } from "packages/lifi-widget/AppDrawer";

const BotActionMetadata = ({ message }: { message: ChatMatrixMessage }) => {
  const setChainId = useSetAtom(chainIdAtom);
  const provider = useProvider();
  const { currentAccount } = useAccounts();
  const { replyBot } = useChatMatrix();
  const signerProvider = provider.getVoidSigner(currentAccount.address);
  const { getSwapRoute, getSwapRouteForEncodedData } = useKyberSwap();

  const currentNetwork = useLazyNetwork();
  const handleSwap = useCallback(
    async (message: ChatMatrixMessage) => {
      try {
        if (currentAccount.source === AccountSource.Address) {
          throw new Error("Cannot create swap for watch-only wallet.");
        }
        // if (currentNetwork?.chainId != Number(message.metadata?.networkId)) {
        //   throw new Error(
        //     `Network wrong!, Please change network to ${currentNetwork?.chainId} ${Number(message.metadata?.networkId)}`,
        //   );
        // }
        if (
          ZERO_ADDRESSES.has(message.metadata!.fromTokenAddress!.toLowerCase())
        ) {
          const router = await getSwapRoute(
            message.metadata!.fromTokenAddress!,
            message.metadata!.toTokenAddress!,
            ethers.parseEther(message.metadata!.amount!).toString(),
          );
          const encode = await getSwapRouteForEncodedData(
            router.routeSummary!,
            50,
            currentAccount.address,
            currentAccount.address,
          );
          const txParams = await provider.populateTransaction({
            to: encode.routerAddress!,
            value: ethers.parseEther(message.metadata!.amount!),
            data: encode.data,
          });
          const gasLimit = await signerProvider.estimateGas(txParams);

          const rpcTx = provider.getRpcTransaction({
            ...txParams,
            from: currentAccount.address,
            gasLimit: (gasLimit * 5n) / 4n,
          });
          const txResPromise = await provider.send("eth_sendTransaction", [
            rpcTx,
          ]);
          replyBot(
            `Successfully swaped! Confirming...`,
            message.id,
            "swap",
            txResPromise,
          );
        } else {
          const contract = ERC20__factory.connect(
            message.metadata!.fromTokenAddress!,
            provider,
          );
          const decimal = await contract.decimals();
          const balance = await contract.balanceOf(currentAccount.address);
          const rawAmount = ethers.parseUnits(
            message.metadata!.amount!,
            decimal,
          );
          if (rawAmount > balance) {
            throw new Error(`Error: insufficient funds for swap`);
          }
          const router = await getSwapRoute(
            message.metadata!.fromTokenAddress!,
            message.metadata!.toTokenAddress!,
            rawAmount.toString(),
          );
          const encode = await getSwapRouteForEncodedData(
            router.routeSummary!,
            50,
            currentAccount.address,
            currentAccount.address,
          );
          const allowBalance = await contract.allowance(
            currentAccount.address,
            encode.routerAddress!,
          );
          if (allowBalance < rawAmount) {
            const tx_approve = await contract.approve.populateTransaction(
              encode.routerAddress!,
              rawAmount - allowBalance,
            );
            const gasLimit = await signerProvider.estimateGas(tx_approve);
            const rpcTxApprove = provider.getRpcTransaction({
              ...tx_approve,
              from: currentAccount.address,
              gasLimit: (gasLimit * 5n) / 4n,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const txResPromise = await provider.send("eth_sendTransaction", [
              rpcTxApprove,
            ]);
            console.log("cantx" + txResPromise);
            return;
          }
          const txParams = await provider.populateTransaction({
            to: encode.routerAddress!,
            data: encode.data,
          });
          const gasLimit = await signerProvider.estimateGas(txParams);

          const rpcTx = provider.getRpcTransaction({
            ...txParams,
            from: currentAccount.address,
            gasLimit: (gasLimit * 5n) / 4n,
          });
          const txResPromise = await provider.send("eth_sendTransaction", [
            rpcTx,
          ]);
          replyBot(
            `Successfully swaped! Confirming...`,
            message.id,
            "swap",
            txResPromise,
          );
        }
      } catch (err: any) {
        replyBot(
          err?.reason || err?.message || "Unknown error.",
          message.id,
          "send",
        );
      }
    },
    [
      currentAccount.address,
      currentAccount.source,
      getSwapRoute,
      getSwapRouteForEncodedData,
      provider,
      replyBot,
      signerProvider,
    ],
  );

  const handleNetworkChange = useCallback(
    (message: ChatMatrixMessage) => {
      const chainId = Number(message.metadata?.networkId);
      setChainId(chainId);
      replyBot(
        `Changed network to ${message.metadata?.networkName}`,
        message.id,
        "change",
      );
    },
    [replyBot, setChainId],
  );

  const handleSendSubmit = useCallback(
    async (
      recipient?: string,
      amount?: string,
      tokenAddress?: string,
      symbol?: string,
    ) =>
      withHumanDelay(async () => {
        try {
          if (currentAccount.source === AccountSource.Address) {
            throw new Error("Cannot create transfer for watch-only wallet.");
          }
          let txParams: ethers.TransactionRequest;
          if (ZERO_ADDRESSES.has(tokenAddress!.toLowerCase())) {
            txParams = await provider.populateTransaction({
              to: recipient,
              value: ethers.parseEther(amount!),
            });
          } else {
            const contract = ERC20__factory.connect(tokenAddress!, provider);
            const decimal = await contract.decimals();
            const rawAmount = ethers.parseUnits(amount!, decimal);
            txParams = await contract.transfer.populateTransaction(
              recipient!,
              rawAmount,
            );
          }

          const gasLimit = await signerProvider.estimateGas(txParams);

          const rpcTx = provider.getRpcTransaction({
            ...txParams,
            from: currentAccount.address,
            gasLimit: (gasLimit * 5n) / 4n,
          });
          const txResPromise = await provider.send("eth_sendTransaction", [
            rpcTx,
          ]);
          const tokenPreview = (
            <PrettyAmount amount={amount!.toString()} currency={symbol} />
          );
          replyBot(
            `<strong>${tokenPreview}</strong> successfully transferred! Confirming...`,
            message.id,
            "send",
            txResPromise,
          );
        } catch (err: any) {
          replyBot(
            err?.reason || err?.message || "Unknown error.",
            message.id,
            "send",
          );
        }
      }),
    [
      currentAccount.address,
      currentAccount.source,
      message.id,
      provider,
      replyBot,
      signerProvider,
    ],
  );
  const metadata = message.metadata!;
  switch (metadata.type) {
    case "send":
      // send to other address
      return (
        <div className="flex flex-col gap-2">
          <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
            {`You have sent ${metadata.amount} ${metadata.toToken} to ${metadata.recipient}`}
          </div>
          <Button
            onClick={() => {
              handleSendSubmit(
                metadata.recipient!,
                metadata.amount!.toString(),
                metadata.toTokenAddress!,
                metadata.toToken!,
              );
            }}
          >
            {`Send ${metadata.amount} ${metadata.toToken}`}
          </Button>
        </div>
      );
    case "swap":
      // swap to other token
      if (message.new_content) {
        return (
          <div className="flex flex-col gap-2">
            <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
              {`successfully swapped ${metadata.amount} ${metadata.fromToken} to ${metadata.toToken}`}
            </div>
            {`TxHash: ${message.metadata!.txHash!}`}
            <Button
              onClick={async () => {
                // const network = await getNetwork(
                //   Number(message.metadata?.networkId),
                // );
                // console.log(network.explorerUrls);
                window.open(
                  `${currentNetwork?.explorerUrls}tx/${message.metadata?.txHash}`,
                  "_blank",
                );
              }}
            >
              {"Transaction detail"}
            </Button>
            {/* <a
              href={`${getNetwork(Number(message.metadata!.networkId!))}/tx/${message.metadata.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              Transaction detail
            </a> */}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-2">
          <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
            {`You want to swap ${metadata.amount} ${metadata.fromToken} to ${metadata.toToken}`}
          </div>
          {!message.metadata?.txHash && (
            <Button
              onClick={() => {
                handleSwap(message);
              }}
            >
              {`Swap ${metadata.amount} ${metadata.fromToken}`}
            </Button>
          )}
        </div>
      );
    case "change":
      // chang to other network
      return (
        <div className="flex flex-col gap-2">
          <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
            {`Change network to ${metadata.networkName}`}
          </div>
          <Button
            onClick={() => {
              handleNetworkChange(message);
            }}
          >
            <span>Switch network</span>
          </Button>
        </div>
      );
    case "buy":
      // chang to other network
      return (
        <div className="flex flex-col gap-2">
          <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
            {`You want to buy ${metadata.amount} ${metadata.toToken}`}
          </div>
          <Button
            onClick={() => {
              console.log();
            }}
          >
            Coming soon
          </Button>
        </div>
      );
    default:
      return null;
  }
};
export default BotActionMetadata;
