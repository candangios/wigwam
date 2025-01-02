import { ChatMessage } from "app/hooks";
import { openDB } from "idb";

// Define the IndexedDB schema
// interface ChatDBSchema extends DBSchema {
//   messages: {
//     key: string; // addressString will be used as the key
//     value: string; // Store an array of ChatMessage for each addressString
//   };
// }

// Open the database
const dbPromise = openDB("keyval-store", 1, {
  upgrade(db) {
    db.createObjectStore("keyval");
  },
});
// Function to add or update messages for a specific addressString
export const saveMessages = async (
  addressString: string,
  messages: ChatMessage[],
) => {
  return (await dbPromise).add("keyval", messages);
  // return (await dbPromise).put("keyval", messages, addressString);
  // const db = await dbPromise;
  // await db.put("messages", messages, addressString);
};

// Function to retrieve messages for a specific addressString
// export const getMessages = async (
//   addressString: string,
// ): Promise<ChatMessage[]> => {
//   const db = await dbPromise;
//   const record = await db.get("messages", addressString);
//   return new Promise((reject, resolve) => { }
//   );
// };

// Function to delete messages for a specific addressString
export const deleteMessages = async (addressString: string) => {
  const db = await dbPromise;
  await db.delete("messages", addressString);
};
