import { FC } from "react";
import { ChatProvider } from "app/hooks";
import { Chat } from "app/components/Assistan/Chat";
const Assistant: FC = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};

export default Assistant;
