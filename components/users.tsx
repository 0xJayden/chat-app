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
}

export default function Users({
  session,
  setOpenConversation,
  users,
  setFromUser,
  setToUser,
  openUsers,
}: UsersInterface) {
  const mutation = trpc.createConversation.useMutation();

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
    if (!user) return;
    setToUser(user);

    const toUserId = user.id;

    const fromUser = users?.users.find((u) => u.email === session?.user?.email);
    setFromUser(fromUser);
    if (!fromUser) return;

    const fromUserId = fromUser.id;

    if (
      user.conversations.length === 0 ||
      user.conversations.find((c) => !c.users.includes(fromUser))
    ) {
      console.log("working");
      mutation.mutate({ toUserId, fromUserId });
      setOpenConversation(true);
    }

    setOpenConversation(true);
  };

  return (
    <div
      className={`flex flex-col fixed right-0 z-10 top-10 items-center p-5 border-l h-full bg-gray-600 ${
        openUsers
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 translate-x-full transition duration-500 ease-out"
      }`}
    >
      <h1>Users</h1>
      {users?.users.map((u) => (
        <div
          className="cursor-pointer"
          key={u.email}
          onClick={() => {
            if (!u) return;
            startConversation(u);
          }}
        >
          {u.email}
        </div>
      ))}
    </div>
  );
}
