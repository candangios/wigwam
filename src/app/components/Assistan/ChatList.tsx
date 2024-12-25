import { useChat, useScrollAnchor } from "app/hooks";
import { EmptyScreen } from "./EmptyScreen";
// import { IconUser } from "./icons";
import { StreamableValue } from "ai/rsc/dist";
import { useStreamableText } from "./useStreamableText";
import { cn } from "./utils";
import { MemoizedReactMarkdown } from "./Markdown";
import { useEffect } from "react";

const ChatList = () => {
  const { messages, isLoading } = useChat();
  const { scrollToBottom } = useScrollAnchor();

  useEffect(() => {
    // if (!isLoading) {
    scrollToBottom();
    // }
  }, [isLoading, scrollToBottom]);
  if (!messages.length) {
    return <EmptyScreen />;
  }
  return (
    <div className="w-full h-full mx-auto ">
      {messages.map((message, index) => (
        <div key={index}>
          {message.display}
          {index < messages.length - 1 && <div className="h-3" />}
        </div>
      ))}
    </div>
  );
};
export default ChatList;

// function UserMessage(content: string) {
//   return (
//     <div className="group relative flex items-start   ">
//       <div className="flex size-[32px] shrink-0 select-none items-center justify-center rounded-full  bg-background shadow-sm">
//         <IconUser />
//       </div>
//       <div className="flex-1 space-y-2 overflow-hidden pl-2 text-[12px] ml-4 ">
//         {content}
//       </div>
//     </div>
//   );
// }
export function BotMessage({
  content,
  className,
}: {
  content: string | StreamableValue<string>;
  className?: string;
}) {
  const text = useStreamableText(content);

  return (
    <div className={cn("group relative flex items-start  ", className)}>
      <div className="flex size-[32px] shrink-0 select-none items-center justify-center rounded-full  bg-primary text-primary-foreground shadow-sm">
        {/* <Image
          src="/images/ChatBotAvatar.png"
          alt="chat bot"
          width={32}
          height={32}
        /> */}
      </div>
      <div className="flex flex-row w-full">
        <div className="ml-[4px] flex-1 space-y-2 overflow-hidden ">
          <MemoizedReactMarkdown className="prose break-words text-[12px] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 ">
            {text}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  );
}
