import { NextSession } from "../utils/utils";
import { Dispatch, SetStateAction } from "react";
import { trpc } from "../utils/trpc";
import { Conversation, User, Session, Message } from "@prisma/client";
interface UsersInterface {
  session: NextSession | null;
  setOpenConversation: Dispatch<SetStateAction<boolean>>;
  users:
    | {
        users: (User & {
          conversations: (Conversation & {
            messages: Message[];
            users: User[];
          })[];
          sessions: Session[];
        })[];
      }
    | undefined;
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
  openUsers: boolean;
  setOpenUsers: Dispatch<SetStateAction<boolean>>;
  setConversationId: Dispatch<SetStateAction<number>>;
}

export default function Users({
  session,
  setOpenConversation,
  users,
  setFromUser,
  setToUser,
  openUsers,
  setOpenUsers,
  setConversationId,
}: UsersInterface) {
  const mutation = trpc.useMutation(["create-conversation"]);

  const startConversation = (
    user:
      | (User & {
          conversations: (Conversation & {
            messages: Message[];
            users: User[];
          })[];
          sessions: Session[];
        })
      | undefined
  ) => {
    if (!user || user.email === session?.user?.email) return;
    setToUser(user);

    const toUserId = user.id;

    const fromUser = users?.users.find((u) => u.email === session?.user?.email);
    setFromUser(fromUser);
    if (!fromUser) return;

    const fromUserId = fromUser.id;

    console.log("to", user);
    console.log("from", fromUser);

    const existingUserInConvo = fromUser.conversations.find((c) =>
      c.users.find((u) => u.email === user.email)
    );

    if (
      existingUserInConvo &&
      existingUserInConvo.users.find((u) => u.email === fromUser.email)
    ) {
      setOpenUsers(false);
      return;
    }

    mutation.mutate(
      { toUserId, fromUserId },
      {
        onSuccess(data: { success: boolean; conversation: Conversation }) {
          setConversationId(data.conversation.id);
          setOpenConversation(true);
        },
      }
    );
    setOpenConversation(true);
    setOpenUsers(false);
  };

  return (
    <div
      className={`flex flex-col fixed right-0 z-10 top-10 items-center py-5 border-l border-gray-500 h-full bg-gray-700 ${
        openUsers
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 translate-x-full transition duration-500 ease-out"
      }`}
    >
      <h1 className="text-lg font-normal">Account</h1>
      <p className="p-2 border-b border-gray-500 cursor-pointer hover:bg-gray-500 transition-all duration-300 ease-out">
        {session?.user?.email}
      </p>
      <h1 className="pt-5 pb-3 text-lg font-normal">Users</h1>
      <>
        <h1 className="text-green-500">Online</h1>
        {users?.users.map(
          (u) =>
            u.email !== session?.user?.email &&
            u.sessions.length > 0 && (
              <div
                className="cursor-pointer border-b border-gray-500 w-full hover:bg-gray-500 transition-all duration-300 ease-out"
                key={u.email}
              >
                <p
                  className="p-2"
                  onClick={() => {
                    if (!u) return;
                    startConversation(u);
                  }}
                >
                  {u.email}
                </p>
              </div>
            )
        )}
      </>
      <>
        <h1 className="text-red-500 pt-5">Offline</h1>
        {users?.users.map(
          (u) =>
            u.email !== session?.user?.email &&
            u.sessions.length === 0 && (
              <div
                className="cursor-pointer border-b border-gray-500 w-full"
                key={u.email}
              >
                <p
                  className="p-2"
                  onClick={() => {
                    if (!u) return;
                    startConversation(u);
                  }}
                >
                  {u.email}
                </p>
              </div>
            )
        )}
      </>
    </div>
  );
}
