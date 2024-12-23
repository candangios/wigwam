import { FC } from "react";
// import sdk, { ClientEvent, EventType, MsgType, RoomEvent } from "matrix-js-sdk";
// import { KnownMembership } from "matrix-js-sdk/lib/@types/membership.js";
import { useAccounts } from "app/hooks";
import { useMatrixClient } from "app/hooks/matrixClient";

// import { ClientProvider } from "core/client";
// import { SelfActivityKind } from "core/types";
const Assistant: FC = () => {
  const { currentAccount } = useAccounts();
  const { matrixClient } = useMatrixClient();
  console.log(matrixClient);
  // const chainId = useChainId();
  // async function login(address: string) {
  //   try {
  //     const resLogin = await axios.post(
  //       "https://api.chatgm.com/api/auth/login/request",
  //       {
  //         wallet_address: address,
  //       },
  //     );
  //     console.log("can");
  //     console.log(resLogin);
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       // Axios-specific error
  //       // console.error('Axios error message:', error.message);
  //       // console.error('Response data:', error.response?.data);
  //       // console.error('Status:', error.response?.status);
  //     } else {
  //       // Non-Axios error
  //       throw error;
  //     }
  //   }
  // }
  // useEffect(() => {
  //   login(currentAccount.address);
  // }, [currentAccount]);

  // const matrixClient = useMemo(async () => {
  //   const provider = new ClientProvider(chainId);
  //   provider.setActivitySource({
  //     type: "self",
  //     kind: SelfActivityKind.Unknown,
  //   });

  //   const signer = provider.getUncheckedSigner(currentAccount.address);
  //   const signature = await signer.signMessage("fsadf").catch((err) => {
  //     console.warn(err);
  //     return null;
  //   });

  //   console.log(currentAccount);
  //   return 2;
  // }, [currentAccount, chainId]);

  return <>{currentAccount.address}</>;
};

export default Assistant;
