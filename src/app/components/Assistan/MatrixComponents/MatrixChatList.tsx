/* eslint-disable prettier/prettier */
import { useAccounts } from "app/hooks";
import classNames from "clsx";
import { ReactComponent as Robot } from "app/icons/robot.svg";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ChatMatrixMessage, useChatMatrix } from "app/hooks/useChatMatrix";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { EmptyScreen } from "../EmptyScreen";
import AutoIcon from "app/components/elements/AutoIcon";
import { MemoizedReactMarkdown } from "../Markdown";

import BotActionMetadata from "./BotActionMetadata";

const MatrixChatList = () => {
  const { messages } = useChatMatrix();

  const { currentAccount } = useAccounts();
  if (!messages.length) {
    return <EmptyScreen />;
  }
  return (
    <ScrollAreaContainer
      className={classNames("relative", "flex flex-col")}
      viewPortClassName="pb-5 rounded-t-[.625rem] pt-5"
      scrollBarClassName="py-0 pt-5 pb-5 !right-1"
    >
      {messages.map((message, index) => (
        <div key={index}>
          {message.sender === "user"
            ? UserMessage(
                message.content,
                currentAccount.name,
                currentAccount.address,
              )
            : BotMessage(message, currentAccount.address)}
          {index < messages.length - 1 && <div className="h-3" />}
        </div>
      ))}
    </ScrollAreaContainer>
  );
};
export default MatrixChatList;

function UserMessage(content: string, walletName: string, address: string) {
  return (
    <div className="group relative flex items-start flex-row-reverse gap-2">
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-14 w-14 min-w-[3.5rem]",
          "mr-3",
          // "bg-black/20",
          // "rounded-[.625rem]",
        )}
      />
      <div className="flex flex-col items-end">
        {/* {walletName} */}
        <div className="flex-1 space-y-2 overflow-hidden text-[13px] bg-[#606069] p-2 rounded-lg gap-2">
          {content}
        </div>
      </div>
    </div>
  );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BotMessage(message: ChatMatrixMessage, _address: string) {
  return (
    <div className="group relative flex items-start   ">
      <Robot
        className={classNames(
          "h-14 w-14 min-w-[3.5rem]",
          "mr-3",
          // "bg-black/20",
          // "rounded-[.625rem]",
        )}
      />
      <div className="flex flex-col">
        {/* <div className="flex-1 space-y-2 overflow-hidden text-[13px] ">
          1chainAi
        </div> */}
        <div className="flex flex-col bg-slate-700 p-2 rounded-lg gap-2 ">
          <MemoizedReactMarkdown
            className="prose break-words text-[13px] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 "
            remarkPlugins={[remarkGfm, remarkMath]}
          >
            {message.content}
          </MemoizedReactMarkdown>
          {message.metadata && (
            <BotActionMetadata message={message}></BotActionMetadata>
          )}
        </div>
      </div>
    </div>
  );
}
