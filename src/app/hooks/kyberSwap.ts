// import { useAccounts } from "./account";
import { kyberApi } from "app/components/Assistan/Service/KeyberSwapApi";
import { useLazyNetwork } from "./network";
interface ExtraFeeRM {
  feeAmount?: string;
  chargeFeeBy?: string;
  isInBps?: string;
  feeReceiver?: string;
}
interface RouteRM {
  pool?: string;
  tokenIn?: string;
  tokenOut?: string;
  limitReturnAmount?: string;
  swapAmount?: string;
  amountOut?: string;
  exchange?: string;
  poolLength?: number;
  poolType?: string;
  poolExtra?: PoolExtraRM;
  extra?: any;
}
interface PoolExtraRM {
  vault?: string;
  poolId?: string;
  tokenOutIndex?: number;
  blockNumber?: number;
}
interface RouteSummaryRM {
  tokenIn?: string;
  amountIn?: string;
  amountInUsd?: string;
  tokenInMarketPriceAvailable?: boolean;
  tokenOut?: string;
  amountOut?: string;
  tokenOutMarketPriceAvailable?: boolean;
  gas?: string;
  gasPrice?: string;
  gasUsd?: string;
  extraFee?: ExtraFeeRM;
  route?: [[RouteRM]];
}
interface GetSwapRouteResponseRM {
  routeSummary?: RouteSummaryRM;
  routerAddress?: string;
}

interface OutputChangeRM {
  amount?: string;
  percent?: number;
  level?: number;
}

interface GetSwapRouteForEncodedDataResponseRM {
  amountIn?: string;
  amountInUsd?: string;
  amountOut?: string;
  amountOutUsd?: string;
  gas?: string;
  gasUsd?: string;
  outputChange?: OutputChangeRM;
  data?: string;
  routerAddress?: string;
}

interface GetSwapInfoWithEncodedDataResponseRM {
  inputAmount?: string;
  outputAmount?: string;
  totalGas?: string;
  gasPriceGwei?: string;
  gasUsd?: number;
  amountInUsd?: number;
  amountOutUsd?: number;
  receivedUsd?: number;
  swaps?: string;
  encodedSwapData?: string;
  routerAddress?: string;
}

export function useKyberSwap() {
  // const { currentAccount } = useAccounts();
  const currentNetwork = useLazyNetwork();

  async function getSwapRoute(
    tokenIn: string,
    tokenOut: string,
    amount: string,
  ) {
    try {
      const respone = await kyberApi.get(
        `${currentNetwork?.chainTag}/api/v1/routes`,
        {
          params: {
            tokenIn,
            tokenOut,
            amount,
          },
        },
      );
      const value: GetSwapRouteResponseRM = respone.data;
      console.log(value);
      return value;
    } catch (error) {
      throw error;
    }
  }
  async function getSwapRouteForEncodedData(
    routeSummary: RouteSummaryRM,
    slippageTolerance: number,
    sender: string,
    recipient: string,
    deadline?: number,
    source?: string,
  ) {
    try {
      const respone = await kyberApi.post(
        `${currentNetwork?.chainTag}/api/v1/route/build`,
        {
          routeSummary,
          deadline,
          slippageTolerance,
          sender,
          recipient,
          source,
        },
      );
      const value: GetSwapRouteForEncodedDataResponseRM = respone.data;
      console.log(value);
      return value;
    } catch (error) {
      throw error;
    }
  }
  async function getSwapInfoWithEncodedData(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    to: string,
    slippageTolenrace?: string,
  ) {
    try {
      const respone = await kyberApi.post(
        `${currentNetwork?.chainTag}/route/encode`,
        {
          tokenIn,
          tokenOut,
          amountIn,
          to,
          slippageTolenrace,
        },
      );
      const value: GetSwapInfoWithEncodedDataResponseRM = respone.data;
      console.log(value);
      return value;
    } catch (error) {
      throw error;
    }
  }

  return {
    getSwapRoute,
    getSwapRouteForEncodedData,
    getSwapInfoWithEncodedData,
  };
}
