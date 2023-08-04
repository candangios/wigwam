import { ethers } from "ethers";
import { wordlists } from "@ethersproject/wordlists";
import { t } from "lib/ext/i18n";
import { assert } from "lib/system/assert";
import { fromProtectedString } from "lib/crypto-utils";

import { SeedPharse } from "core/types";

import { PublicError } from "./base";

export const derivationPathRegex = new RegExp("^m(\\/[0-9]+'?)+$");

export function generatePreviewHDNodes(
  extendedKey: string,
  offset = 0,
  limit = 9
) {
  const root = ethers.utils.HDNode.fromExtendedKey(extendedKey);

  const nodes: ethers.utils.HDNode[] = [];
  for (let i = offset; i < offset + limit; i++) {
    nodes.push(root.derivePath(i.toString()));
  }

  return nodes;
}

export function toNeuterExtendedKey(
  hdNode: ethers.utils.HDNode,
  derivationPath?: string
) {
  if (derivationPath) {
    hdNode = hdNode.derivePath(derivationPath);
  }

  return hdNode.neuter().extendedKey;
}

export function getSeedPhraseHDNode({ phrase, lang }: SeedPharse) {
  return ethers.utils.HDNode.fromMnemonic(
    fromProtectedString(phrase),
    undefined,
    wordlists[lang]
  );
}

export function validateSeedPhrase({ phrase, lang }: SeedPharse) {
  assert(lang in wordlists, t("seedPhraseLanguageNotSupported"), PublicError);

  try {
    assert(
      ethers.utils.isValidMnemonic(fromProtectedString(phrase), wordlists[lang])
    );
  } catch {
    throw new PublicError(t("seedPhraseIsNotValid"));
  }
}

export function validateDerivationPath(path: string) {
  if (!derivationPathRegex.test(path)) {
    throw new PublicError(t("invalidDerivationPath"));
  }
}

export function validatePrivateKey(privKey: string) {
  try {
    privKey = add0x(privKey);
    assert(ethers.utils.isHexString(privKey, 32));
  } catch {
    throw new PublicError(t("invalidPrivateKey"));
  }
}

export function validatePublicKey(pubKey: string) {
  try {
    pubKey = add0x(pubKey);
    assert(
      ethers.utils.isHexString(pubKey, 33) ||
        ethers.utils.isHexString(pubKey, 65)
    );
  } catch {
    throw new PublicError(t("invalidPublicKey"));
  }
}

export function validateAddress(value: string) {
  try {
    assert(ethers.utils.isAddress(value));
  } catch {
    throw new PublicError(t("invalidAddress"));
  }
}

export function add0x(value: string) {
  return /^[0-9a-f]*$/i.test(value) ? `0x${value}` : value;
}
