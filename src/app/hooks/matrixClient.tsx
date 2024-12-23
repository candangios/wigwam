import axios from "axios";
import { useAccounts } from "./account";
import { createClient } from "matrix-js-sdk";
import { useEffect, useMemo } from "react";
export function useMatrixClient() {
  const { currentAccount } = useAccounts();

  // const chainId = useChainId();
  useEffect(() => {
    console.log("here");
  }, [currentAccount]);
  async function login(address: string) {
    try {
      const resLogin = await axios.post(
        "https://api.chatgm.com/api/auth/login/request",
        {
          wallet_address: address,
        },
      );
      console.log("can");
      console.log(resLogin);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error
        if (error.message === "fegfer") {
          console.log(error.message);
        } else {
          throw error;
        }
      } else {
        // Non-Axios error
        throw error;
      }
    }
  }

  const matrixClient = useMemo(async () => {
    try {
      await login(currentAccount.address);
      console.log(currentAccount.address);
      const matrixClient1 = createClient({
        baseUrl: "myHomeServer",
        accessToken: "myAccessToken",
        userId: "myUserId",
      });
      return matrixClient1;
    } catch (error) {
      console.log(error);
    }
    // return 1;
  }, [currentAccount]);
  return { matrixClient };
}
