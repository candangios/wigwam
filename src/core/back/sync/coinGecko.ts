import axios from "axios";
import memoize from "mem";
import ExpiryMap from "expiry-map";

import { COINGECKO_NATIVE_TOKEN_IDS } from "fixtures/networks";

export type CGPriceRecord = { usd: number; usd_24h_change: number };
export type CoinGeckoPrices = Record<string, CGPriceRecord>;

export const coinGeckoApi = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 60_000,
});

const tokenPricesCache = new ExpiryMap<string, CGPriceRecord>(3 * 60_000);

export async function getCoinGeckoPrices(
  chainId: number,
  tokenAddresses: string[]
) {
  try {
    if (tokenAddresses.length === 0) return {};

    const platformIds = await getCoinGeckoPlatformIds();

    const platform = platformIds.get(chainId);
    if (!platform) return {};

    const getCacheKey = (ta: string) => `${chainId}_${ta}`;

    const tokenAddressesToRefresh: string[] = [];
    const data: CoinGeckoPrices = {};

    for (let tokenAddress of tokenAddresses) {
      tokenAddress = tokenAddress.toLowerCase();
      const cached = tokenPricesCache.get(getCacheKey(tokenAddress));

      if (cached) {
        data[tokenAddress] = cached;
      } else {
        tokenAddressesToRefresh.push(tokenAddress);
      }
    }

    if (tokenAddressesToRefresh.length === 0) {
      return data;
    }

    const { data: freshData } = await coinGeckoApi.get<CoinGeckoPrices>(
      `/simple/token_price/${platform}`,
      {
        params: {
          contract_addresses: tokenAddressesToRefresh.join(),
          vs_currencies: "USD",
          include_24hr_change: true,
        },
      }
    );

    for (const [tokenAddress, price] of Object.entries(freshData)) {
      tokenPricesCache.set(getCacheKey(tokenAddress), price);
    }

    return { ...data, ...freshData };
  } catch (err) {
    console.warn(err);

    return {};
  }
}

export const getCoinGeckoPlatformIds = memoize(
  async () => {
    const { data } = await coinGeckoApi.get("/asset_platforms");

    const platformIds = new Map<number, string>();

    for (const { id, chain_identifier } of data) {
      if (typeof chain_identifier === "number" && chain_identifier) {
        platformIds.set(chain_identifier, id);
      }
    }

    return platformIds;
  },
  {
    maxAge: 24 * 60 * 60_000, // 1 day
  }
);

export const getCoinGeckoNativeTokenPrice = async (chainId: number) => {
  const platformId = COINGECKO_NATIVE_TOKEN_IDS.get(chainId);
  if (!platformId) return null;

  try {
    const prices = await getCoinGeckoPlatformPrices();

    return platformId in prices ? prices[platformId] : null;
  } catch (err) {
    console.warn(err);

    return null;
  }
};

export const getCoinGeckoPlatformPrices = memoize(
  async () => {
    const { data } = await coinGeckoApi.get("/simple/price", {
      params: {
        ids: Array.from(COINGECKO_NATIVE_TOKEN_IDS.values()).join(),
        vs_currencies: "USD",
        include_24hr_change: true,
      },
    });

    return data as CoinGeckoPrices;
  },
  {
    maxAge: 3 * 60_000, // 3 min
  }
);