import { ERC20__factory } from "abi-types";
import { chainIdAtom } from "app/atoms";
import Button from "app/components/elements/Button";
// import PrettyAmount from "app/components/elements/PrettyAmount";
// import PrettyAmount from "app/components/elements/PrettyAmount";
import { useAccounts, useProvider } from "app/hooks";
// import { useToast } from "app/hooks/toast";
import { ChatMatrixMessage, useChatMatrix } from "app/hooks/useChatMatrix";
import { withHumanDelay } from "app/utils";
import { ZERO_ADDRESSES } from "core/common";
import { AccountSource } from "core/types";
import { ethers } from "ethers";
import { useSetAtom } from "jotai";
// import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { useCallback } from "react";

const BotActionMetadata = ({ message }: { message: ChatMatrixMessage }) => {
  const setChainId = useSetAtom(chainIdAtom);
  const provider = useProvider();
  const { currentAccount } = useAccounts();
  const { replyBot } = useChatMatrix();
  const signerProvider = provider.getVoidSigner(currentAccount.address);
  // const { updateToast } = useToast();
  // const isMounted = useIsMounted();
  const handleNetworkChange = useCallback(
    (chainId: number) => {
      setChainId(chainId);
    },
    [setChainId],
  );

  const handleSubmit = useCallback(
    async (recipient: string, amount: string, tokenAddress: string) =>
      withHumanDelay(async () => {
        if (currentAccount.source === AccountSource.Address) {
          return alert({
            title: "Watch-only account",
            content: <span>Cannot create transfer for watch-only wallet.</span>,
          });
        }
        try {
          let txParams: ethers.TransactionRequest;
          if (ZERO_ADDRESSES.has(tokenAddress.toLowerCase())) {
            console.log("native token");
            txParams = await provider.populateTransaction({
              to: recipient,
              value: ethers.parseEther(amount),
            });
          } else {
            console.log("Erc 20 token");
            const contract = ERC20__factory.connect(tokenAddress, provider);
            const decimal = await contract.decimals();
            const rawAmount = ethers.parseUnits(amount, decimal);
            txParams = await contract.transfer.populateTransaction(
              recipient,
              rawAmount,
            );
            // const rawAmount =
            //   "decimals" in token && token.decimals > 0
            //     ? ethers.parseUnits(amount, token.decimals)
            //     : amount;

            // switch (standard) {
            //   case TokenStandard.ERC20:
            //     {
            //       const contract = ERC20__factory.connect(
            //         tokenAddress,
            //         provider,
            //       );

            //       txParams = await contract.transfer.populateTransaction(
            //         recipient,
            //         rawAmount,
            //       );
            //     }
            //     break;
            //   default:
            //     throw new Error("Unhandled Token ERC standard");
            // }
          }

          const gasLimit = await signerProvider.estimateGas(txParams);

          const rpcTx = provider.getRpcTransaction({
            ...txParams,
            from: currentAccount.address,
            gasLimit: (gasLimit * 5n) / 4n,
          });
          const txResPromise = provider.send("eth_sendTransaction", [rpcTx]);

          // if (currentNetwork) {
          //   trackEvent(
          //     token.tokenType === TokenType.Asset
          //       ? TEvent.TokenTransferCreated
          //       : TEvent.NftTransferCreated,
          //     {
          //       networkName: currentNetwork.name,
          //       networkChainId: currentNetwork.chainId,
          //       tokenName: token.name,
          //       tokenAddress,
          //     },
          //   );
          // }

          // const tokenPreview = (
          //   <PrettyAmount amount={amount?.toString()} currency={"dsfgsd"} />
          // );

          // updateToast(
          //   <>
          //     Request for transfer <strong>{tokenPreview}</strong> successfully
          //     successfully created! Please approve it in the opened window.
          //   </>,
          // );

          txResPromise
            .then((txHash) => {
              console.log(txHash);
              // if (isMounted()) {
              //   setTokenType(token.tokenType);

              //   setTimeout(
              //     () => navigate((s) => ({ ...s, page: Page.Default })),
              //     50,
              //   );

              //   setTimeout(() => {
              //     updateToast(
              //       <div className="flex flex-col">
              //         <p>
              //           <strong>{tokenPreview}</strong> successfully
              //           transferred! Confirming...
              //         </p>

              //         {explorerLink && (
              //           <a
              //             href={explorerLink.tx(txHash)}
              //             target="_blank"
              //             rel="noopener noreferrer"
              //             className="mt-1 underline"
              //           >
              //             View the transaction in{" "}
              //             <span className="whitespace-nowrap">
              //               explorer
              //               <ExternalLinkIcon className="h-5 w-auto ml-1 inline-block" />
              //             </span>
              //           </a>
              //         )}
              //       </div>,
              //     );
              //   }, 100);
              // }
            })
            .catch((err) => {
              console.warn(err);

              // if (isMounted()) updateToast(null);
            });
        } catch (err: any) {
          console.log(err?.reason || err?.message || "Unknown error.");
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
              handleSubmit(
                metadata.recipient!,
                metadata.amount!.toString(),
                metadata.toTokenAddress!,
              );
            }}
          >
            {`Send ${metadata.amount} ${metadata.toToken}`}
          </Button>
        </div>
      );
    case "swap":
      // swap to other token
      return <></>;
    case "change":
      // chang to other network
      return (
        <div className="flex flex-col gap-2">
          <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
            {`Change network to ${metadata.networkName}`}
          </div>
          <Button
            onClick={() => {
              handleNetworkChange(Number(metadata.networkId));
            }}
          >
            {" "}
            Switch network
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
            {" "}
            Buy on Moonpay
          </Button>
        </div>
      );
    default:
      return null;
  }
};
export default BotActionMetadata;
