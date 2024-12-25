import axios from "axios";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";

export interface ChatMessage {
  id: string;
  sender: string; // e.g., "user" or "Assistan"
  content: string;
  display?: ReactNode;
  timestamp: number;
}
export function useChatManager() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add a new message
  const addMessage = useCallback(async (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    const bot = await submitUserMessage(message.content, message.id);
    setMessages((prev) => [...prev, bot]);
  }, []);
  async function submitUserMessage(content: string, promptId: string) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://api.chatgm.com/api/ai/messages`,
        { message: content },
      );
      setIsLoading(false);
      return {
        id: promptId,
        sender: "assistant",
        content: response.data.data.message,
        timestamp: Date.now(),
      };
    } catch (error) {
      // Handle the error properly
      setIsLoading(false);
      let msg = "";
      if (axios.isAxiosError(error)) {
        // Error is an AxiosError
        msg = error.message;
        console.error("Axios error occurred:", error.message);

        // Access additional error details
        if (error.response) {
          msg = error.response.data.message;
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          msg = error.request;
          console.error("No response received:", error.request);
        } else {
          msg = error.message;
          console.error("Error setting up the request:", error.message);
        }
      } else {
        // Handle other types of errors (non-Axios errors)
        msg = `${error}`;
        console.error("An unexpected error occurred:", error);
      }
      return {
        id: promptId,
        sender: "assistant",
        content: msg,
        timestamp: Date.now(),
      };
    }
  }
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
    addMessage,
    clearMessages,
    getMessagesBySender,
    isLoading,
  };
}
const ChatContext = createContext<
  ReturnType<typeof useChatManager> | undefined
>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const chatManager = useChatManager();
  return (
    <ChatContext.Provider value={chatManager}>{children}</ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
