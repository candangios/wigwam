import { providers as multicallProviders } from "@0xsequence/multicall";
import { providers } from "ethers";
import mem from "mem";

export async function performRpc(
  chainId: number,
  url: string,
  method: string,
  params: any
) {
  console.info("Perform RPC request", { chainId, url, method, params });

  const { plainProvider, multicallProvider } = await getProvider(url, chainId);

  switch (method) {
    case "getBalance":
      return multicallProvider.getBalance(params.address, params.blockTag);

    case "getCode":
      return multicallProvider.getCode(params.address, params.blockTag);

    case "call":
      return multicallProvider.call(params.transaction, params.blockTag);

    default:
      return plainProvider.perform(method, params);
  }
}

const getProvider = mem(async (url: string, chainId: number) => {
  const plainProvider = new RpcProvider(url, chainId);
  const multicallProvider = new multicallProviders.MulticallProvider(
    plainProvider
  );

  return { plainProvider, multicallProvider };
});

class RpcProvider extends providers.JsonRpcProvider {
  async detectNetwork() {
    return this.network;
  }
}