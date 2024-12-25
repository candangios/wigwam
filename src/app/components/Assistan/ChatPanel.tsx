import * as React from "react";
import { PromptForm } from "./PromptForm";
import { useChat } from "app/hooks";
import { nanoid } from "nanoid";
import CircleSpinner from "../elements/CircleSpinner";
export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
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
}: ChatPanelProps) {
  const { messages, isLoading, addMessage } = useChat();
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
    const promotId = nanoid();
    const newMessage = {
      id: promotId,
      sender: "user",
      content: content,
      timestamp: Date.now(),
    };
    addMessage(newMessage);
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

      <PromptForm
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
