import { Dispatch, FC, memo, SetStateAction, useCallback } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import classNames from "clsx";

import { FEE_MODES, FeeMode, FeeSuggestions } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { useAccountToken } from "app/hooks";
import PrettyAmount from "app/components/elements/PrettyAmount";
import FiatAmount from "app/components/elements/FiatAmount";
import TabHeader from "app/components/elements/approvals/TabHeader";
import PlusMinusInput from "app/components/elements/approvals/PlusMinusInput";
import {
  FEE_MODE_NAMES,
  formatUnits,
  parseUnits,
  Tx,
} from "app/components/screens/approvals/Transaction";

type FeeTabProps = {
  originTx: Tx;
  fees: FeeSuggestions | null;
  maxFee: ethers.BigNumber | null;
  feeMode: FeeMode;
  setFeeMode: Dispatch<FeeMode>;
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const FeeTab = memo<FeeTabProps>(
  ({
    originTx: tx,
    overrides,
    onOverridesChange,
    fees,
    maxFee,
    feeMode,
    setFeeMode,
  }) => {
    const changeValue = useCallback(
      (name: string, value: ethers.BigNumberish | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value }));
      },
      [onOverridesChange]
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) changeValue(name, null);
      },
      [changeValue]
    );

    const handleFeeModeChange = useCallback(
      (mode: FeeMode) => {
        if (!mode) return;

        setFeeMode(mode);
        // Clean-up ovverides if mode (re)enabled
        onOverridesChange(
          (o) =>
            ({
              ...o,
              gasPrice: null,
              maxFeePerGas: null,
              maxPriorityFeePerGas: null,
            } as any)
        );
      },
      [setFeeMode, onOverridesChange]
    );

    return (
      <>
        <TabHeader tooltip="Edit network fee">Edit network fee</TabHeader>
        {fees && maxFee && (
          <FeeModeSelect
            gasLimit={ethers.BigNumber.from(overrides.gasLimit ?? tx.gasLimit!)}
            fees={fees}
            maxFee={maxFee}
            value={feeMode}
            onValueChange={handleFeeModeChange}
            className="mb-4"
          />
        )}

        {tx.maxPriorityFeePerGas ? (
          <>
            <PlusMinusInput
              label="Max base fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              value={formatUnits(
                overrides.maxFeePerGas ?? tx.maxFeePerGas,
                "gwei"
              )}
              onChange={(e) =>
                changeValue("maxFeePerGas", parseUnits(e.target.value, "gwei"))
              }
              onBlur={(e) => fixValue("maxFeePerGas", e.target.value)}
              className="mb-3"
              onMinusClick={() => undefined}
              onPlusClick={() => undefined}
            />

            <PlusMinusInput
              label="Priority fee"
              placeholder="0.00"
              thousandSeparator
              decimalScale={9}
              value={formatUnits(
                overrides.maxPriorityFeePerGas ?? tx.maxPriorityFeePerGas,
                "gwei"
              )}
              onChange={(e) =>
                changeValue(
                  "maxPriorityFeePerGas",
                  parseUnits(e.target.value, "gwei")
                )
              }
              onBlur={(e) => fixValue("maxPriorityFeePerGas", e.target.value)}
              onMinusClick={() => undefined}
              onPlusClick={() => undefined}
            />
          </>
        ) : (
          <PlusMinusInput
            label="Gas Price"
            placeholder="0.00"
            thousandSeparator
            decimalScale={9}
            value={formatUnits(overrides.gasPrice ?? tx.gasPrice, "gwei")}
            onChange={(e) =>
              changeValue("gasPrice", parseUnits(e.target.value, "gwei"))
            }
            onBlur={(e) => fixValue("gasPrice", e.target.value)}
            onMinusClick={() => undefined}
            onPlusClick={() => undefined}
          />
        )}
      </>
    );
  }
);

export default FeeTab;

type FeeModeSelectProps = {
  gasLimit: ethers.BigNumber;
  fees: FeeSuggestions;
  maxFee: ethers.BigNumber;
  value: FeeMode;
  onValueChange: (value: FeeMode) => void;
  className?: string;
};

const FeeModeSelect = memo<FeeModeSelectProps>(
  ({ gasLimit, fees, maxFee, value, onValueChange, className }) => {
    return (
      <ToggleGroup.Root
        type="single"
        orientation="horizontal"
        value={
          gasLimit.mul(fees.modes[value].max).eq(maxFee) ? value : undefined
        }
        onValueChange={onValueChange}
        className={classNames("grid grid-cols-3 gap-2.5", className)}
      >
        {FEE_MODES.map((mode) => {
          const modeMaxFee = gasLimit.mul(fees.modes[mode].max);

          return (
            <FeeModeItem
              key={mode}
              value={mode}
              fee={modeMaxFee}
              selected={modeMaxFee.eq(maxFee)}
            />
          );
        })}
      </ToggleGroup.Root>
    );
  }
);

type FeeModeItemProps = {
  value: FeeMode;
  fee: ethers.BigNumber;
  selected: boolean;
};

const FeeModeItem: FC<FeeModeItemProps> = ({ value, fee, selected }) => {
  const nativeToken = useAccountToken(NATIVE_TOKEN_SLUG);

  const usdAmount =
    fee && nativeToken?.priceUSD
      ? new BigNumber(fee.toString())
          .div(new BigNumber(10).pow(nativeToken.decimals))
          .multipliedBy(nativeToken.priceUSD)
      : new BigNumber(0);

  return (
    <ToggleGroup.Item
      value={value}
      className={classNames(
        "relative",
        "bg-brand-main/5",
        "flex flex-col items-center",
        "w-full py-2 px-1",
        "rounded-[.625rem]",
        "transition-colors",
        "group",
        !selected && "hover:bg-brand-main/10",
        selected && "bg-brand-main/[.2]"
      )}
    >
      <span className="mb-1.5 text-sm items-center">
        <span className="mr-1.5">{FEE_MODE_NAMES[value].icon}</span>
        {FEE_MODE_NAMES[value].name}
      </span>

      <FiatAmount
        amount={usdAmount}
        threeDots={false}
        className="text-sm font-bold mb-0.5 truncate"
      />

      {nativeToken && (
        <PrettyAmount
          amount={fee.toString()}
          currency={nativeToken.symbol}
          decimals={nativeToken.decimals}
          threeDots={false}
          className={classNames(
            "text-xs text-brand-inactivedark truncate",
            "transition-colors",
            selected && "!text-brand-light"
          )}
        />
      )}
    </ToggleGroup.Item>
  );
};
