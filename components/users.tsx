import { NextSession } from "../utils/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { trpc } from "../utils/trpc";
import { Conversation, User, Session, Message } from "@prisma/client";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
  fromUser:
    | (User & {
        conversations: (Conversation & {
          messages: Message[];
          users: User[];
        })[];
        sessions: Session[];
      })
    | undefined;
  refetchUsers: () => void;
  fromEmail: string;
  openHi: boolean;
  setOpenHi: Dispatch<SetStateAction<boolean>>;
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
  fromUser,
  refetchUsers,
  fromEmail,
  openHi,
  setOpenHi,
}: UsersInterface) {
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState("");

  const mutation = trpc.useMutation(["create-conversation"]);
  const setNameMutation = trpc.useMutation(["set-name"]);

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

  const submitName = () => {
    setNameMutation.mutate(
      { fromEmail, name },
      {
        onSuccess() {
          refetchUsers();
          setName("");
        },
      }
    );
  };

  return (
    <>
      {openHi && (
        <div
          className={`sticky flex justify-center items-center z-30 animate-popup`}
        >
          <div
            className={`flex flex-col justify-between items-center w-[300px] h-[100px] bg-green-500 rounded p-5 text-center text-2xl
          `}
          >
            <h1>Hi, {fromUser?.name}</h1>
          </div>
        </div>
      )}
      {openProfile && (
        <div className="fixed flex inset-0 justify-center items-center z-20 backdrop-brightness-75">
          <div className="flex flex-col space-y-3 text-center border border-gray-500 rounded h-[550px] w-[350px] p-2 bg-gray-700">
            <XMarkIcon
              onClick={() => setOpenProfile(false)}
              className="cursor-pointer absolute rounded-full transition-all duration-200 ease-out hover:bg-red-500"
              height="15px"
            />
            <h1 className="font-normal text-lg">Profile</h1>
            <p>Current name: {fromUser?.name ? fromUser.name : "None"}</p>
            <input
              value={name ? name : ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="rounded outline-none p-2 text-gray-700"
            />
            <button
              onClick={() => submitName()}
              className="border border-gray-500 rounded py-2 px-4 bg-gray-200 text-gray-700"
            >
              Set Name
            </button>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col fixed right-0 z-10 top-10 items-center py-5 border-l border-gray-500 h-full bg-gray-700 ${
          openUsers
            ? "opacity-100 transition duration-500 ease-out"
            : "opacity-0 translate-x-full transition duration-500 ease-out"
        }`}
      >
        <h1 className="text-lg font-normal">Account</h1>
        <p
          onClick={() => setOpenProfile(true)}
          className="w-full text-center p-2 border-b border-gray-500 cursor-pointer hover:bg-gray-500 transition-all duration-300 ease-out"
        >
          {fromUser?.name ? fromUser.name : session?.user?.email}
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
                    {u.name ? u.name : u.email}
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
                    {u.name ? u.name : u.email}
                  </p>
                </div>
              )
          )}
        </>
      </div>
    </>
  );
}
