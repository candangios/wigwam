import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import { ChatPanel } from "./ChatPanel";
// import { EmptyScreen } from "./EmptyScreen";
import { useChat, useScrollAnchor } from "app/hooks";

export function Chat() {
  const [input, setInput] = useState("");
  const { isLoading } = useChat();
  const { messagesRef, scrollRef, visibilityRef, scrollToBottom } =
    useScrollAnchor();

  // const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
  //   useScrollAnchor();

  // const authenticateUser = async () => {
  //   console.log("hehe");
  // };

  useEffect(() => {
    scrollToBottom();
  }, [isLoading, scrollToBottom]);
  return (
    <div className="flex flex-col h-[calc(100vh_-_100px)]">
      <div
        className="w-full flex-grow overflow-y-auto scrollbar-hide py-2"
        ref={scrollRef}
      >
        {/* <ButtonScrollToBottom
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
        /> */}

        <div ref={messagesRef}>
          <ChatList />
          <div className="w-full h-px" ref={visibilityRef} />
        </div>
      </div>
      <ChatPanel
        input={input}
        setInput={(value: string) => {
          setInput(value);
          // setMessages([...messages, { id: "dgd", content: value }]);
          // console.log(value);
        }}
        isAtBottom={true}
        scrollToBottom={() => {
          console.log("scrollToBottom");
        }}
      />
    </div>
  );
}
