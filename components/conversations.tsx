import { Dispatch, SetStateAction } from "react";
import { Conversation, Message, Session, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

interface ConversationsInterface {
  fromEmail: string;
  openMenu: boolean;
  setConversationId: Dispatch<SetStateAction<number>>;
  setFromUser: Dispatch<
    SetStateAction<
      | (User & {
          conversations: (Conversation & {
            messages: Message[];
            users: User[];
          })[];
          sessions: Session[];
        })
      | undefined
    >
  >;
  setToUser: Dispatch<
    SetStateAction<
      | (User & {
          conversations: (Conversation & {
            messages: Message[];
            users: User[];
          })[];
          sessions: Session[];
        })
      | undefined
    >
  >;
}

export default function Conversations({
  fromEmail,
  openMenu,
  setConversationId,
  setFromUser,
  setToUser,
}: ConversationsInterface) {
  const { data: session } = useSession();

  const { data: conversations } = trpc.getConversations.useQuery({ fromEmail });
  return (
    <div
      className={`flex flex-col fixed left-0 top-10 z-10 items-center border-r h-full bg-gray-500 ${
        openMenu
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 -translate-x-full transition duration-500 ease-out"
      }`}
    >
      <h1 className="p-5">Conversations</h1>
      <div className="flex flex-col w-full">
        {conversations?.conversations.map((c) => (
          <div
            className="cursor-pointer p-2 border-b"
            key={c.id}
            onClick={() => {
              setConversationId(c.id);
              setFromUser(c.users[1]);
              setToUser(c.users[0]);
            }}
          >
            {c.id}
          </div>
        ))}
      </div>
    </div>
  );
}
