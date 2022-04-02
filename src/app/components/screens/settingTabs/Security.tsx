import { FC, memo, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { Form, Field } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { fromProtectedString } from "lib/crypto-utils";

import { getSeedPhrase } from "core/client";

import { required } from "app/utils";
import Switcher from "app/components/elements/Switcher";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";
import NewButton from "app/components/elements/NewButton";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import PasswordField from "app/components/elements/PasswordField";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";

const Security: FC = () => {
  const [revealModalOpened, setRevealModalOpened] = useState(false);
  const [syncData, setSyncData] = useState(false);
  const [phishing, setPhishing] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Reveal Seed Phrase</SettingsHeader>
      <NewButton
        theme="secondary"
        className={classNames(
          "flex !justify-start items-center",
          "text-left",
          "!px-3 !py-2 mr-auto"
        )}
        onClick={() => setRevealModalOpened(true)}
      >
        <RevealIcon className="w-[1.625rem] h-auto mr-3" />
        Reveal
      </NewButton>
      <Separator className="my-8" />
      <SettingsHeader>Security</SettingsHeader>
      <Switcher
        id="syncThirdParty"
        text={syncData ? "Syncing" : "Not syncing"}
        label="Sync data using third-party explorers"
        checked={syncData}
        onCheckedChange={setSyncData}
        className="min-w-[20rem]"
      />
      <Switcher
        id="phishingDetection"
        text={phishing ? "Enabled" : "Disabled"}
        checked={phishing}
        label="Use Phishing Detection"
        onCheckedChange={setPhishing}
        className="mt-3 min-w-[20rem]"
      />
      {revealModalOpened && (
        <SeedPhraseModal
          open={true}
          onOpenChange={() => setRevealModalOpened(false)}
        />
      )}
    </div>
  );
};

export default Security;

const SeedPhraseModal = memo<SecondaryModalProps>(({ open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const windowFocused = useWindowFocus();

  useEffect(() => {
    if (!windowFocused && seedPhrase) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, seedPhrase, windowFocused]);

  const handleConfirmPassword = useCallback(async ({ password }) => {
    try {
      const seed = await getSeedPhrase(password);
      setSeedPhrase(seed.phrase);
    } catch (err: any) {
      return { [FORM_ERROR]: err?.message };
    }
    return;
  }, []);

  return (
    <SecondaryModal
      header="Reveal secret phrase"
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase ? (
        <SeedPhraseField value={fromProtectedString(seedPhrase)} />
      ) : (
        <Form
          initialValues={{ terms: "false" }}
          onSubmit={handleConfirmPassword}
          render={({
            handleSubmit,
            submitting,
            modifiedSinceLastSubmit,
            submitError,
          }) => (
            <form
              className="flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="w-[20rem] relative mb-3">
                <Field name="password" validate={required}>
                  {({ input, meta }) => (
                    <PasswordField
                      className="w-full"
                      placeholder="Type password"
                      label="Confirm your password"
                      error={
                        (meta.touched && meta.error) ||
                        (!modifiedSinceLastSubmit && submitError)
                      }
                      errorMessage={
                        meta.error || (!modifiedSinceLastSubmit && submitError)
                      }
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <NewButton
                type="submit"
                className="mt-6 !min-w-[14rem]"
                disabled={submitting}
              >
                {submitting ? "Loading" : "Reveal"}
              </NewButton>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});