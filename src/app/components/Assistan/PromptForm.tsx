import * as React from "react";
import { useEnterSubmit } from "app/hooks/useEnterSubmit";
import { Input } from "./Input";
import { nanoid } from "nanoid";
import { IconButton } from "packages/lifi-widget/components/ReverseTokensButton/ReverseTokensButton.style";
import { IconUser } from "./icons";
import { useChat } from "app/hooks";
export function PromptForm({
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
  const { addMessage, isLoading } = useChat();
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
  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault();

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target["message"]?.blur();
        }

        const value = input.trim();
        setInput("");
        if (!value) return;

        // Optimistically add user message UI
        const promotId = nanoid();
        const newMessage = {
          id: promotId,
          sender: "user",
          content: value,
          display: (
            <div className="group relative flex items-start   ">
              <div className="flex size-[32px] shrink-0 select-none items-center justify-center rounded-full  bg-background shadow-sm">
                <IconUser />
              </div>
              <div className="flex-1 space-y-2 overflow-hidden pl-2 text-[12px] ml-4 ">
                {value}
              </div>
            </div>
          ),
          timestamp: Date.now(),
        };
        addMessage(newMessage);

        // const bot = await submitUserMessage(value, promotId);
        // addMessage(bot);
        // dispatch({ type: "ADD_MESSAGE", payload: bot });
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
        <div>
          {/* <SendIcon /> */}
          <IconButton
            size="small"
            disableRipple
            className="withHover"
            onClick={() => console.log("send")}
            sx={{
              background: "#2C3036",
              borderRadius: "4px",
              padding: "3px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="19"
              viewBox="0 0 18 19"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.4193 14.8708L10.6034 13.4194C10.6812 12.8054 11.3202 12.4361 11.8904 12.6754L13.2395 13.2418C13.3943 13.3067 13.5657 13.2492 13.6497 13.1039L14.7442 11.2084C14.8275 11.0639 14.7918 10.8849 14.6591 10.7841L13.494 9.89909C12.9992 9.5232 12.9993 8.78945 13.494 8.41341L14.6591 7.52838C14.7918 7.42757 14.8277 7.24864 14.7442 7.10412L13.6497 5.20861C13.5657 5.06333 13.3943 5.00579 13.2395 5.07069L11.8904 5.63708C11.3202 5.8764 10.6812 5.50712 10.6034 4.89311L10.4193 3.44155C10.3986 3.27809 10.2611 3.15625 10.0942 3.15625H7.90562C7.73885 3.15625 7.60124 3.27794 7.58051 3.44155L7.39647 4.89311C7.35876 5.19058 7.19711 5.43336 6.93765 5.58344L6.93795 5.58404C6.67955 5.73323 6.38389 5.75231 6.10941 5.63708L4.7603 5.07069C4.55884 4.98611 4.37104 5.13079 4.35016 5.20861L3.25585 7.10412C3.17247 7.24864 3.20823 7.42757 3.34088 7.52838L4.50595 8.41341C5.00083 8.78945 5.00083 9.52305 4.50595 9.89909L3.34088 10.7841C3.20823 10.8849 3.17232 11.064 3.25585 11.2084L4.35031 13.1039C4.43429 13.2492 4.60571 13.3067 4.76045 13.2418L6.10956 12.6754C6.38404 12.5602 6.6797 12.5793 6.9381 12.7286L6.9378 12.7292C7.19726 12.8793 7.35891 13.1219 7.39662 13.4195L7.58066 14.871C7.60139 15.0346 7.73885 15.1562 7.90577 15.1562H10.0944C10.2611 15.1561 10.3986 15.0343 10.4193 14.8708ZM8.99993 6.75137C11.1355 6.75137 12.2119 9.34562 10.7004 10.857C9.18892 12.3683 6.59497 11.2919 6.59497 9.15633C6.59497 7.82825 7.6717 6.75137 8.99993 6.75137Z"
                fill="white"
              />
            </svg>
          </IconButton>
          {/* <Button
            type="submit"
            size="icon"
            disabled={input === ""}
          >
            <span className="sr-only">Send Question</span>
          </Button> */}
        </div>
      </div>
    </form>
  );
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start ">
      <div className="flex size-[32px] shrink-0 select-none items-center justify-center rounded-full  bg-primary text-primary-foreground shadow-sm">
        {/* <Image
          src="/images/ChatBotAvatar.png"
          alt="chat bot"
          width={32}
          height={32}
        /> */}
        {/* <IconOpenAI /> */}
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        typing
      </div>
    </div>
  );
}
