import * as React from "react";

import { MatrixPromptForm } from "./MatixPromptForm";
import CircleSpinner from "app/components/elements/CircleSpinner";
import { useChatMatrix } from "app/hooks/useChatMatrix";

export interface MatixChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function MatrixChatPanel({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  input,
  setInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAtBottom,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollToBottom,
}: MatixChatPanelProps) {
  const { messages, isLoading, submitUserMessage } = useChatMatrix();
  const exampleMessages = [
    {
      content: "What is the Bitcoin?",
    },
    {
      content: "Will SOL reach 200$ at the end of 2024?",
    },
    {
      content: "What coin should i buy for 2025?",
    },
  ];
  async function SendMessage(content: string) {
    submitUserMessage(content);
  }

  return (
    <div>
      <div className=" flex  w-full  flex-wrap gap-[5px] items-center justify-center overflow-hidden ">
        {messages.length == 0 &&
          exampleMessages.map((example, index) => (
            <div
              key={index}
              className={`cursor-pointer px-4 h-[30px] flex items-center justify-center rounded-[5px] `}
              onClick={async () => {
                if (isLoading) return;
                SendMessage(example.content);
              }}
            >
              <div className="text-[13px] text-center">{example.content}</div>
            </div>
          ))}
      </div>
      {isLoading && (
        <div className="flex">
          <CircleSpinner className="mr-1 !w-5 !h-5 !text-brand-inactivelight" />
          <p>Assistan is replying ...</p>
        </div>
      )}

      <MatrixPromptForm
        input={input}
        setInput={setInput}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onFocusInput={(_isFocus: any) => {
          // setIsShowExample(isFocus)
        }}
      />
    </div>
  );
}
