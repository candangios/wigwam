import axios from "axios";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useAccounts } from "./account";
import { matrixApi } from "app/components/Assistan/Service/MatrixApi";

import { useChainId } from "./chainId";
import { ClientProvider } from "core/client";
import { SelfActivityKind } from "core/types";
import {
  createClient,
  RoomEvent,
  LoginResponse,
  MsgType,
  TimelineEvents,
} from "matrix-js-sdk/lib";
import { RoomMessageEventContent } from "matrix-js-sdk/lib/types";

export interface MetadataMatrixMessage {
  type?: string;
  amount?: string;
  sender?: string;
  recipient?: string;
  networkId?: string;
  networkName?: string;
  currency?: string;
  tokenAddress?: string;
  txHash?: string;
  fromToken?: string;
  toToken?: string;
  linkScan: string;
  fromTokenAddress?: string;
  toTokenAddress?: string;
}
export interface ChatMatrixMessage {
  id: string;
  sender: string; // e.g., "user" or "Assistan"
  content: string;
  timestamp: number;
  metadata?: MetadataMatrixMessage;
}
interface GMUser {
  gmAccessToken: string;
  walletAddress: string;
}
interface MatrixUser {
  accessToken: string;
  userId: string;
}

export function useChatMatrixManager() {
  const { currentAccount } = useAccounts();
  const [gmUser, setGmUser] = useState<GMUser | null>(null);
  const [matrixUser, setMatixUser] = useState<MatrixUser | null>(null);
  const chainId = useChainId();

  const [messages, setMessages] = useState<ChatMatrixMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [room_id, setRoomID] = useState<string | null>(null);

  useEffect(() => {
    async function requestScoutWallet(address: string) {
      try {
        const resRequestScoutWallet = await matrixApi.post(
          "auth/scout/wallet",
          {
            wallet_address: address,
          },
        );
        return resRequestScoutWallet.data.data;
      } catch (error) {
        throw error;
      }
    }
    async function verifyWallet(address: string, chainId: number, data: any) {
      try {
        const provider = new ClientProvider(chainId);
        const signer = provider.getUncheckedSigner(currentAccount.address);
        const signature = await signer.signMessage(
          `app.chatgm.com wants you to sign in with your Ethereum account:\n${address.toLowerCase()}\n\nI agree to the ChatGM's Terms of Service: https://app.chatgm.com/tos\n\nURI: https://app.chatgm.com\nVersion: 1\nChain ID: 1\nNonce: ${data.nonce}\nIssued At: ${data.issued_at}`,
        );
        const resRequestVerifyWallet = await matrixApi.post(
          "auth/verify/wallet",
          {
            wallet_address: address,
            handover_code: data.handover_code,
            signature,
          },
        );
        return {
          wallet_address: resRequestVerifyWallet.data.data.walletAddress,
          is_verified: resRequestVerifyWallet.data.data.isVerified,
        };
      } catch (error) {
        throw error;
      }
    }
    async function registerWallet(address: string, handover_code: string) {
      const password = address.slice(address.length - 8, address.length);
      try {
        const resRequestRegisterWallet = await matrixApi.post(
          "auth/signup/wallet",
          {
            wallet_address: address,
            handover_code,
            password: password,
            handle: `gm.${password}`,
          },
        );
        return resRequestRegisterWallet.data.data;
      } catch (error) {
        throw error;
      }
    }
    async function requestLogin(address: string) {
      try {
        const resRequestLogin = await matrixApi.post("auth/login/request", {
          wallet_address: address,
        });
        const provider = new ClientProvider(chainId);
        provider.setActivitySource({
          type: "self",
          kind: SelfActivityKind.Unknown,
        });

        const signer = provider.getUncheckedSigner(currentAccount.address);
        const signature = await signer.signMessage(
          `app.chatgm.com wants you to sign in with your Ethereum account:\n${currentAccount.address.toLowerCase()}\n\nI agree to the ChatGM's Terms of Service: https://app.chatgm.com/tos\n\nURI: https://app.chatgm.com\nVersion: 1\nChain ID: 1\nNonce: ${resRequestLogin.data.data.nonce}\nIssued At: ${resRequestLogin.data.data.issued_at}`,
        );
        const resLogin = await matrixApi.post("auth/login/wallet", {
          wallet_address: address,
          handover_code: resRequestLogin.data.data.handover_code,
          signature: signature,
        });
        setGmUser({
          gmAccessToken: resLogin.data.data.access_token,
          walletAddress: resLogin.data.data.wallet_address,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.data.message === "User does not exist") {
            // create new user
            const resRequestScoutWallet = await requestScoutWallet(address);
            await verifyWallet(address, chainId, resRequestScoutWallet);
            await registerWallet(address, resRequestScoutWallet.handover_code);
            await requestLogin(address);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
    setMessages([]);
    matrix?.stopClient();
    const data = localStorage.getItem(
      `${currentAccount.address.toLocaleLowerCase()}_matrixUser`,
    );
    if (data) {
      const matrixUser: MatrixUser = JSON.parse(data);
      setMatixUser(matrixUser);
      const roomID = localStorage.getItem(
        `${currentAccount.address.toLocaleLowerCase()}_Roomid`,
      );
      setRoomID(roomID);
    } else {
      requestLogin(currentAccount.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  const matrix = useMemo(() => {
    try {
      if (matrixUser) {
        const matrixClient = createClient({
          baseUrl: "https://chatgm.com/",
          accessToken: matrixUser.accessToken,
          userId: matrixUser.userId,
        });
        matrixClient.startClient({ initialSyncLimit: 30 });
        if (!room_id) {
          matrixClient
            .createRoom({ invite: ["@gm.1chainAI:chatgm.com"] })
            .then((value: { room_id: string }) => {
              localStorage.setItem(
                `${gmUser?.walletAddress.toLocaleLowerCase()}_Roomid`,
                value.room_id,
              );
            })
            .catch((error) => {
              console.log("create room error:" + error);
            });
        }
        matrixClient.on(
          RoomEvent.Timeline,
          function (event, room, toStartOfTimeline) {
            if (room?.roomId !== room_id) {
              return;
            }
            if (toStartOfTimeline) {
              return; // don't print paginated results
            }
            if (event.getType() !== "m.room.message") {
              // console.log("newmessage" + room?.name);
              return; // only print messages
            }
            // console.log(event.getDetails);
            const msg: ChatMatrixMessage = {
              id: event.getId() ?? "",
              sender:
                event.getSender() === "@gm.1chainAI:chatgm.com"
                  ? "bot"
                  : "user",
              content: event.getContent().body, //event.getContent().body,
              metadata: event.getContent().metadata,
              timestamp: event.getAge() ?? 1,
            };
            setMessages((prev) => [...prev, msg]);
            console.log(
              // the room name will update with m.room.name events automatically
              "(%s) %s :: %s",
              event.getId(),
              event.getSender(),
              JSON.stringify(event.getContent()),
            );
          },
        );
        return matrixClient;
      }
      if (gmUser === null) return;
      const matrixClient = createClient({
        baseUrl: "https://chatgm.com/",
      });

      matrixClient
        .login("org.matrix.login.jwt", {
          initial_device_display_name: "ChatGM web",
          refresh_token: false,
          token: gmUser.gmAccessToken,
        })
        .then((value: LoginResponse) => {
          // save matrixUserInfo
          localStorage.setItem(
            `${gmUser.walletAddress.toLocaleLowerCase()}_matrixUser`,
            JSON.stringify({
              accessToken: value.access_token,
              userId: value.user_id,
            }),
          );
          if (!room_id) {
            matrixClient
              .createRoom({ invite: ["@gm.1chainAI:chatgm.com"] })
              .then((value: { room_id: string }) => {
                localStorage.setItem(
                  `${gmUser.walletAddress.toLocaleLowerCase()}_Roomid`,
                  value.room_id,
                );
              })
              .catch((error) => {
                console.log("create room error:" + error);
              });
          }
          matrixClient.startClient({ initialSyncLimit: 30 });
          if (!room_id) {
            matrixClient
              .createRoom({ invite: ["@gm.1chainAI:chatgm.com"] })
              .then((value: { room_id: string }) => {
                setRoomID(value.room_id);
                localStorage.setItem(
                  `${gmUser?.walletAddress.toLocaleLowerCase()}_Roomid`,
                  value.room_id,
                );
              })
              .catch((error) => {
                console.log("create room error:" + error);
              });
          }
          matrixClient.on(
            RoomEvent.Timeline,
            function (event, room, toStartOfTimeline) {
              if (room?.roomId !== room_id) {
                return;
              }
              if (toStartOfTimeline) {
                return; // don't print paginated results
              }
              if (event.getType() !== "m.room.message") {
                // console.log("newmessage" + room?.name);
                return; // only print messages
              }
              // console.log(event.getDetails);
              const msg: ChatMatrixMessage = {
                id: event.getId() ?? "",
                sender:
                  event.getSender() === "@gm.1chainAI:chatgm.com"
                    ? "bot"
                    : "user",
                content: event.getContent().body, //event.getContent().body,
                timestamp: event.getAge() ?? 1,
              };
              setMessages((prev) => [...prev, msg]);
            },
          );
        })
        .catch((error: any) => {
          console.log("login matrix error:" + error);
        });
      matrixClient.startClient({ initialSyncLimit: 50 });
      return matrixClient;
    } catch (error) {
      console.log(error);
    }
  }, [gmUser, matrixUser, room_id]);
  async function submitUserMessage(msg: string) {
    if (!room_id) return;
    setIsLoading(true);
    try {
      const content: RoomMessageEventContent = {
        msgtype: MsgType.Text,
        body: msg,
        // metadata: {
        //   networkId: chainId,
        //   address: currentAccount.address,
        // },
      };
      await matrix?.sendEvent(
        room_id,
        "m.room.message" as keyof TimelineEvents,
        content,
        "",
      );
      // await matrix?.sendTextMessage(room_id, content, "");
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  const replyBot = async (
    msg: string,
    eventId: string,
    type: string,
    txHash?: string,
  ) => {
    try {
      if (!room_id) return;
      setIsLoading(true);
      console.log(eventId + type + txHash);
      const content: RoomMessageEventContent = {
        msgtype: MsgType.Text,
        body: msg,
        // metadata: {
        //   eventId,
        //   txHash,
        //   type,
        // },
      };
      const a = await matrix?.sendEvent(
        room_id,
        "m.unknown" as keyof TimelineEvents,
        content,
      );
      console.log("cangrlooooo" + a?.event_id);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Get messages from a specific sender
  const getMessagesBySender = useCallback(
    (sender: "user" | "bot") => {
      return messages.filter((message) => message.sender === sender);
    },
    [messages],
  );

  return {
    messages,
    submitUserMessage,
    replyBot,
    clearMessages,
    getMessagesBySender,
    isLoading,
  };
}
const ChatContext = createContext<
  ReturnType<typeof useChatMatrixManager> | undefined
>(undefined);

export const ChatMatrixProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const chatManager = useChatMatrixManager();
  return (
    <ChatContext.Provider value={chatManager}>{children}</ChatContext.Provider>
  );
};

export function useChatMatrix() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
