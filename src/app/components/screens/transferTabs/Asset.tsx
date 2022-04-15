import { FC, forwardRef, memo, ReactNode, useCallback, useMemo } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";
import { Erc20__factory } from "abi-types";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";

import { AccountAsset } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";

import {
  composeValidators,
  maxValue,
  required,
  validateAddress,
} from "app/utils";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useNativeCurrency,
  useProvider,
} from "app/hooks";
import { useAccountToken } from "app/hooks/tokens";
import { useDialog } from "app/hooks/dialog";
import TokenSelect from "app/components/elements/TokenSelect";
import LongTextField, {
  LongTextFieldProps,
} from "app/components/elements/LongTextField";
import NewButton from "app/components/elements/NewButton";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import AssetInput from "app/components/elements/AssetInput";
import USDAmount from "app/components/elements/USDAmount";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";

const Asset: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom) ?? NATIVE_TOKEN_SLUG;
  const currentToken = useAccountToken(tokenSlug) as AccountAsset;
  const { alert } = useDialog();

  const provider = useProvider();

  const sendEther = useCallback(
    async (recipient: string, amount: string) => {
      return await provider.getSigner(currentAccount.address).sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });
    },
    [currentAccount.address, provider]
  );

  const sendToken = useCallback(
    async (
      recipient: string,
      tokenContract: string,
      amount: string,
      decimals: number
    ) => {
      const signer = provider.getSigner(currentAccount.address);
      const contract = Erc20__factory.connect(tokenContract, signer);

      const convertedAmount = ethers.utils.parseUnits(amount, decimals);

      return await contract.transfer(recipient, convertedAmount);
    },
    [currentAccount.address, provider]
  );

  const handleSubmit = useCallback(
    async ({ recipient, amount }) => {
      if (!tokenSlug) {
        return;
      }
      try {
        if (tokenSlug === NATIVE_TOKEN_SLUG) {
          await sendEther(recipient, amount);
        } else {
          const tokenContract = parseTokenSlug(tokenSlug).address;

          await sendToken(
            recipient,
            tokenContract,
            amount,
            currentToken.decimals
          );
        }
      } catch (err: any) {
        alert({ title: "Error!", content: err.message });
      }
    },
    [alert, currentToken, sendEther, sendToken, tokenSlug]
  );

  const maxAmount = useMemo(
    () =>
      currentToken?.rawBalance
        ? new BigNumber(currentToken.rawBalance)
            .div(new BigNumber(10).pow(currentToken.decimals))
            .decimalPlaces(currentToken.decimals, BigNumber.ROUND_DOWN)
            .toString()
        : "0",
    [currentToken]
  );

  return (
    <Form
      onSubmit={handleSubmit}
      render={({ form, handleSubmit, values, submitting }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <TokenSelect
            handleTokenChanged={() => form.change("amount", undefined)}
          />
          <Field
            name="recipient"
            validate={composeValidators(required, validateAddress)}
          >
            {({ input, meta }) => (
              <AddressField
                setFromClipboard={(value) => form.change("recipient", value)}
                error={meta.error && meta.touched}
                errorMessage={meta.error}
                className="mt-5"
                {...input}
              />
            )}
          </Field>
          <div className="relative mt-5">
            <Field
              name="amount"
              validate={composeValidators(
                required,
                maxValue(maxAmount, currentToken?.symbol)
              )}
            >
              {({ input, meta }) => (
                <AssetInput
                  label="Amount"
                  placeholder="0.00"
                  thousandSeparator={true}
                  assetDecimals={currentToken?.decimals}
                  withMaxButton
                  handleMaxButtonClick={() => form.change("amount", maxAmount)}
                  error={meta.error && meta.modified}
                  errorMessage={meta.error}
                  inputClassName="pr-20"
                  {...input}
                />
              )}
            </Field>
            {currentToken && (
              <span
                className={classNames(
                  "absolute top-11 right-4",
                  "text-sm font-bold"
                )}
              >
                {currentToken.symbol}
              </span>
            )}
          </div>
          <div className="mt-6 flex items-start">
            <TxCheck currentToken={currentToken} values={values} />
          </div>
          <NewButton
            type="submit"
            className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
            disabled={submitting}
          >
            <SendIcon className="mr-2" />
            {submitting ? "Transfering" : "Transfer"}
          </NewButton>
        </form>
      )}
    />
  );
};

export default Asset;

type TxCheckProps = {
  currentToken: AccountAsset;
  values: any;
};

const TxCheck = memo<TxCheckProps>(({ currentToken, values }) => {
  const nativeCurrency = useNativeCurrency();

  return (
    <>
      <Tooltip
        content={
          <>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus dolor purus non enim praesent elementum
              facilisis leo
            </p>
            <p className="mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus
            </p>
          </>
        }
        placement="left-start"
        size="large"
        className="mr-2"
      >
        <TooltipIcon />
      </Tooltip>
      <div className="flex flex-col">
        <TippySingletonProvider>
          <SummaryRow
            header={
              <>
                Amount:{" "}
                <USDAmount
                  amount={values.amount ?? 0}
                  currency={currentToken?.symbol ?? undefined}
                  copiable
                  className="font-bold"
                />
              </>
            }
            value={
              <USDAmount
                amount={
                  values.amount && currentToken
                    ? new BigNumber(values.amount).multipliedBy(
                        currentToken.priceUSD ?? 0
                      )
                    : 0
                }
                copiable
              />
            }
            className="mb-1"
          />
          <SummaryRow
            header={
              <>
                Average Fee:{" "}
                <USDAmount
                  amount={0.13}
                  currency={nativeCurrency?.symbol ?? undefined}
                  copiable
                  className="font-bold"
                />
              </>
            }
            value={<USDAmount amount={9.55} copiable />}
            className="mb-1"
          />
          <SummaryRow
            header={
              <>
                Total:{" "}
                <USDAmount
                  amount={
                    values.amount && currentToken
                      ? new BigNumber(values.amount)
                          .multipliedBy(currentToken.priceUSD ?? 0)
                          .plus(9.55)
                      : 9.55
                  }
                  copiable
                  className="font-bold"
                />
              </>
            }
          />
        </TippySingletonProvider>
      </div>
    </>
  );
});

type AddressFieldProps = LongTextFieldProps & {
  setFromClipboard: (value: string) => void;
};

const AddressField = forwardRef<HTMLTextAreaElement, AddressFieldProps>(
  ({ setFromClipboard, className, ...rest }, ref) => {
    const { paste, pasted } = usePasteFromClipboard(setFromClipboard);

    return (
      <div className={classNames("relative", className)}>
        <LongTextField
          ref={ref}
          label="Recipient"
          placeholder="0x0000000000000000000000000000000000000000"
          textareaClassName="!h-20"
          maxLength={42}
          {...rest}
        />
        <NewButton
          theme="tertiary"
          onClick={paste}
          className={classNames(
            "absolute bottom-[1.125rem] right-3",
            "text-sm text-brand-light",
            "!p-0 !pr-1 !min-w-0",
            "!font-normal",
            "cursor-copy",
            "items-center"
          )}
        >
          {pasted ? (
            <SuccessIcon className="mr-1" />
          ) : (
            <PasteIcon className="mr-1" />
          )}
          {pasted ? "Pasted" : "Paste"}
        </NewButton>
      </div>
    );
  }
);

type SummaryRowProps = {
  header: string | ReactNode;
  value?: string | ReactNode;
  className?: string;
};

const SummaryRow: FC<SummaryRowProps> = ({ header, value, className }) => (
  <div className={classNames("flex items-center", "text-sm", className)}>
    <h4 className="font-bold">{header}</h4>
    {value && <span className="text-brand-inactivedark ml-1">({value})</span>}
  </div>
);
