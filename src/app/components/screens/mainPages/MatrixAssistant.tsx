import { FC } from "react";
import { ChatMatrixProvider } from "app/hooks/useChatMatrix";
import { ChatMatrix } from "app/components/Assistan/ChatMatrix";

// import { ClientProvider } from "core/client";
// import { SelfActivityKind } from "core/types";
const Assistant: FC = () => {
  return (
    <ChatMatrixProvider>
      <ChatMatrix />
    </ChatMatrixProvider>
  );
};

export default Assistant;
