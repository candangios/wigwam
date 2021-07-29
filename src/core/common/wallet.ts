import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";

import { SeedPharse } from "core/types";

import { PublicError } from "./base";

export function generatePreviewAddresses(
  extendedKey: string,
  offset = 0,
  limit = 9
) {
  const root = ethers.utils.HDNode.fromExtendedKey(extendedKey);

  const addresses: string[] = [];
  for (let i = offset; i < offset + limit; i++) {
    addresses.push(root.derivePath(i.toString()).address);
  }

  return addresses;
}

export function toNeuterExtendedKey(
  seedPhrase: SeedPharse,
  derivationPath: string
) {
  return ethers.utils.HDNode.fromMnemonic(
    seedPhrase.phrase,
    undefined,
    wordlists[seedPhrase.lang]
  )
    .derivePath(derivationPath)
    .neuter().extendedKey;
}

export function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(lang in wordlists, t("seedPhraseLanguageNotSupported"), PublicError);
  assert(
    ethers.utils.isValidMnemonic(phrase, wordlists[lang]),
    t("seedPhraseIsNotValid"),
    PublicError
  );
}

export function validateDerivationPath(path: string) {
  const valid = (() => {
    if (!path.startsWith("m")) {
      return false;
    }
    if (path.length > 1 && path[1] !== "/") {
      return false;
    }

    const parts = path.replace("m", "").split("/").filter(Boolean);
    if (
      !parts.every((path) => {
        const pNum = +(path.includes("'") ? path.replace("'", "") : path);
        return Number.isSafeInteger(pNum) && pNum >= 0;
      })
    ) {
      return false;
    }

    return true;
  })();

  if (!valid) {
    throw new PublicError(t("derivationPathIsInvalid"));
  }
}

export function validatePrivateKey(privKey: string) {
  try {
    new ethers.Wallet(privKey);
  } catch {
    throw new PublicError(t("invalidPrivateKey"));
  }
}

export function validatePublicKey(pubKey: string) {
  try {
    ethers.utils.computeAddress(pubKey);
  } catch {
    throw new PublicError(t("invalidPublicKey"));
  }
}
