import { FC } from "react";
// import sdk, { ClientEvent, EventType, MsgType, RoomEvent } from "matrix-js-sdk";
// import { KnownMembership } from "matrix-js-sdk/lib/@types/membership.js";
import { ChatProvider, useAccounts } from "app/hooks";
import { useMatrixClient } from "app/hooks/matrixClient";
import { Chat } from "app/components/Assistan/Chat";

// import { ClientProvider } from "core/client";
// import { SelfActivityKind } from "core/types";
const Assistant: FC = () => {
  const { currentAccount } = useAccounts();
  const { matrixClient } = useMatrixClient();
  console.log(currentAccount.address);
  console.log(matrixClient);
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};

export default Assistant;
