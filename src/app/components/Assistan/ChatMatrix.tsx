// import { EmptyScreen } from "./EmptyScreen";
import { useChatMatrix } from "app/hooks/useChatMatrix";
import { MatrixChatPanel } from "./MatrixComponents/MatrixChatPanel";
import { useEffect, useState } from "react";
import { useScrollAnchor } from "app/hooks";
import MatrixChatList from "./MatrixComponents/MatrixChatList";

export function ChatMatrix() {
  const [input, setInput] = useState("");
  const { messages } = useChatMatrix();
  const { messagesRef, visibilityRef, scrollToBottom } = useScrollAnchor();
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);
  return (
    <div className="flex flex-col h-[calc(100vh_-_100px)]">
      <div className="w-full flex-grow overflow-y-auto scrollbar-hide py-2">
        <div ref={messagesRef}>
          <MatrixChatList />
          <div className="w-full h-px" ref={visibilityRef} />
        </div>
      </div>
      <MatrixChatPanel
        input={input}
        setInput={(value: string) => {
          setInput(value);
        }}
        isAtBottom={true}
        scrollToBottom={() => {
          console.log("scrollToBottom");
        }}
      />
    </div>
  );
}
