import { memo, Suspense, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom, useAtomValue } from "jotai";
import browser from "webextension-polyfill";

import { useIsMounted } from "lib/react-hooks/useIsMounted";
import { isPopup } from "lib/ext/view";
import { rejectAllApprovals } from "core/client";

import { activityModalAtom, approvalStatusAtom } from "app/atoms";
import { IS_FIREFOX } from "app/defaults";
import { OverflowProvider } from "app/hooks";
import { ReactComponent as LinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as ActivityGlassIcon } from "app/icons/activity-glass.svg";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";

import Button from "../../elements/Button";
import ScrollAreaContainer from "../../elements/ScrollAreaContainer";
import IconedButton from "../../elements/IconedButton";

import ApprovalStatus from "../ApprovalStatus";
import ActivitiesList from "./ActivitiesList";

const ActivityModal = memo(() => {
  const [activityOpened, setActivityOpened] = useAtom(activityModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setActivityOpened([open, "replace"]);
    },
    [setActivityOpened],
  );

  const isMounted = useIsMounted();
  const bootAnimationDisplayed = activityOpened && isMounted();

  const isPopupMode = isPopup();

  return (
    <Dialog.Root open={activityOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20",
            "w-full",
            !isPopupMode && "max-h-[41rem] min-w-[40rem] max-w-4xl",
            "m-auto inset-x-0",
            isPopupMode ? "inset-y-0" : "inset-y-[3.5rem]",
            !isPopupMode && "rounded-[2.5rem]",
            bootAnimationDisplayed && "animate-modalcontent",
          )}
        >
          {!isPopupMode && (
            <div
              className={classNames(
                "flex items-center justify-center",
                "w-[5.5rem] h-[5.5rem]",
                "rounded-full",
                "bg-brand-dark/20",
                "backdrop-blur-[10px]",
                IS_FIREFOX && "!bg-[#0E1314]",
                "border border-brand-light/5",
                "shadow-addaccountmodal",
                "absolute",
                "top-0 left-1/2",
                "-translate-x-1/2 -translate-y-1/2",
                "z-30",
              )}
            >
              <ActivityGlassIcon className="w-12 h-auto mb-0.5" />
            </div>
          )}
          <OverflowProvider>
            {(ref) => (
              <ScrollAreaContainer
                ref={ref}
                className={classNames(
                  "w-full h-full",
                  !isPopupMode && "rounded-[2.5rem]",
                  "border border-brand-light/5",
                  "brandbg-large-modal",
                  !isPopupMode && [
                    "after:absolute after:inset-0",
                    "after:shadow-addaccountmodal",
                    "after:rounded-[2.5rem]",
                    "after:pointer-events-none",
                    "after:z-20",
                  ],
                )}
                viewPortClassName="viewportBlock"
                horizontalScrollBarClassName={classNames(
                  isPopupMode ? "" : "px-[2.25rem]",
                )}
                verticalScrollBarClassName={classNames(
                  isPopupMode ? "" : "pt-[4.25rem] pb-[3.25rem]",
                  isPopupMode ? "!right-0" : "!right-1",
                )}
                hiddenScrollbar={isPopupMode ? "horizontal" : undefined}
                type="scroll"
              >
                <Dialog.Close
                  className={classNames(
                    isPopupMode ? "top-7" : "top-4",
                    "absolute right-4",
                  )}
                  asChild
                >
                  {isPopupMode ? (
                    <IconedButton Icon={CloseIcon} theme="tertiary" />
                  ) : (
                    <Button theme="clean">Cancel</Button>
                  )}
                </Dialog.Close>

                <Suspense fallback={null}>
                  {activityOpened && <ActivityContent />}
                </Suspense>
              </ScrollAreaContainer>
            )}
          </OverflowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default ActivityModal;

const ActivityContent = memo(() => {
  const isPopupMode = isPopup();
  const [delayFinished, setDelayFinished] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayFinished(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={classNames(
        isPopupMode ? "w-full" : "w-[54rem]",
        "mx-auto h-full",
        "px-4",
        isPopupMode ? "pt-6" : "pt-16",
        "flex flex-col",
        !delayFinished ? "hidden" : "animate-bootfadeinfast",
      )}
    >
      {!isPopupMode && <Approve />}
      <ActivitiesList />
    </div>
  );
});

const Approve = memo(() => {
  const approvalStatus = useAtomValue(approvalStatusAtom);

  const handleApprove = useCallback(() => {
    browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
  }, []);

  return (
    <>
      {approvalStatus.total > 0 && (
        <div
          className={classNames(
            "w-full h-14 mb-10",
            "border border-brand-inactivedark/25",
            "animate-pulse hover:animate-none",
            "rounded-2xl",
            "flex items-center",
            "py-2.5 px-5",
          )}
        >
          <ApprovalStatus readOnly theme="large" />
          <div className="flex-1" />

          <button
            type="button"
            className={classNames(
              "mr-2",
              "px-2 py-1",
              "!text-sm text-brand-inactivelight hover:text-brand-light",
              "transition-colors",
              "font-semibold",
            )}
            onClick={() => rejectAllApprovals()}
          >
            Reject all
          </button>

          <Button className="!py-2 !text-sm" onClick={handleApprove}>
            Approve
            <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
          </Button>
        </div>
      )}
    </>
  );
});
