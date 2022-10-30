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
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
}

export default function Conversations({
  fromEmail,
  openMenu,
  setConversationId,
  setFromUser,
  setToUser,
  setOpenMenu,
}: ConversationsInterface) {
  const { data: session } = useSession();

  const { data: conversations, isSuccess } = trpc.useQuery(
    ["get-conversations", { fromEmail }],
    {
      onError(err) {
        console.log(err, "err");
      },
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div
      className={`flex flex-col fixed left-0 top-10 z-10 items-center border-r h-full bg-gray-500 ${
        openMenu
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 -translate-x-full transition duration-500 ease-out"
      }`}
    >
      <h1 className="p-5">Conversations</h1>
      {isSuccess && (
        <div className="flex flex-col w-full">
          {conversations?.conversations.map((c) => (
            <div
              className="cursor-pointer p-2 border-b"
              key={c.id}
              onClick={() => {
                setConversationId(c.id);
                if (c.users[0].email === fromEmail) {
                  setFromUser(c.users[0]);
                  setToUser(c.users[1]);
                } else {
                  setFromUser(c.users[1]);
                  setToUser(c.users[0]);
                }
                setOpenMenu(false);
              }}
            >
              {c.users.find((u) => u.email !== fromEmail)?.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
