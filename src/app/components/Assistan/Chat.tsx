"use server";
import { useState } from "react";
import ChatList from "./ChatList";
import { ChatPanel } from "./ChatPanel";
// import { EmptyScreen } from "./EmptyScreen";
import { useScrollAnchor } from "app/hooks";

export function Chat() {
  const [input, setInput] = useState("");
  const { messagesRef, scrollRef, visibilityRef } = useScrollAnchor();

  // const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
  //   useScrollAnchor();

  // const authenticateUser = async () => {
  //   console.log("hehe");
  // };

  return (
    <div className="mx-[25px] pt-[16px] flex h-[calc(100vh_-_86px)]">
      <div className="flex flex-col w-full">
        <div className="w-full flex-grow z-0 overflow-y-scroll" ref={scrollRef}>
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
    </div>
  );
}
