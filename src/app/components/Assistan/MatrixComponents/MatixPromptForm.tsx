import * as React from "react";
import classNames from "clsx";
import { useEnterSubmit } from "app/hooks/useEnterSubmit";
import { Input } from "../Input";
import { ReactComponent as SendButton } from "app/icons/Send_button.svg";
import { useChatMatrix } from "app/hooks/useChatMatrix";
export function MatrixPromptForm({
  input,
  setInput,
  onFocusInput,
}: {
  input: string;
  setInput: (value: string) => void;
  onFocusInput: (isFocus: boolean) => void;
}) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { submitUserMessage, isLoading } = useChatMatrix();
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  React.useEffect(() => {
    if (!isLoading) {
      console.log(" scroll to bottom");
    }
  }, [isLoading]);

  async function SendMessage(content: string) {
    submitUserMessage(content);
  }

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault();
        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target["message"]?.blur();
        }
        if (isLoading) return;
        const value = input.trim();
        setInput("");
        if (!value) return;
        await SendMessage(value);
      }}
    >
      <div className=" flex h-[60px] w-full grow flex-row items-center overflow-hidden  ">
        <Input
          ref={inputRef}
          tabIndex={0}
          onKeyDown={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            onKeyDown;
          }}
          placeholder="Ask me anything."
          className=" w-full h-[42px] resize-none bg-[#606069] font-sans text-[12px] rounded-full   pl-4 py-[1.3rem] focus:outline-none shadow-inputText text-white"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          value={input}
          onFocus={() => {
            onFocusInput(true);
          }}
          onBlur={() => {
            onFocusInput(false);
          }}
          onChange={(e: any) => setInput(e.target.value)}
        />
        <div className="mx-2 cursor-pointer">
          <SendButton
            className={classNames(
              "ml-1",
              "w-6 h-6",
              "mmd:w-5 mmd:h-5",
              "mxs:w-[1.125rem] mxs:h-[1.125rem]",
            )}
            onClick={async () => {
              if (isLoading) return;
              const value = input.trim();
              setInput("");
              if (!value) return;
              await SendMessage(value);
            }}
          />
        </div>
      </div>
    </form>
  );
}
