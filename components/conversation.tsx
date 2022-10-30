import { NextSession } from "../utils/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { User, Conversation, Session, Message } from "@prisma/client";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

interface ConversationWindowInterface {
  openConversation: boolean;
  session: NextSession | null;
  toUser:
    | (User & {
        conversations: (Conversation & {
          messages: Message[];
          users: User[];
        })[];
        sessions: Session[];
      })
    | undefined;
  fromUser:
    | (User & {
        conversations: (Conversation & {
          messages: Message[];
          users: User[];
        })[];
        sessions: Session[];
      })
    | undefined;
  convoId: number;
  fromEmail: string;
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  setOpenUsers: Dispatch<SetStateAction<boolean>>;
}

export default function ConversationWindow({
  openConversation,
  session,
  toUser,
  fromUser,
  convoId,
  fromEmail,
  setOpenMenu,
  setOpenUsers,
}: ConversationWindowInterface) {
  const [message, setMessage] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<
    | (Conversation & {
        messages: Message[];
        users: User[];
      })
    | null
  >(null);

  const query = trpc.getConversation.useQuery(
    {
      convoId,
    },
    {
      onError(err) {
        console.log("no conversation selected.", err);
      },
      onSuccess(data) {
        setCurrentConversation(data.conversation);
      },
      refetchInterval: 600,
    }
  );

  const mutation = trpc.sendMessage.useMutation();

  const sendMessage = async () => {
    if (!message || !session?.user) return;
    console.log("email", fromEmail, "user", fromUser, convoId);
    if (!fromEmail || !convoId) return;
    mutation.mutate({ message, fromEmail, convoId });
    setMessage(null);
    // setTimeout(() => query.refetch(), 600);
  };

  return (
    <div
      onClick={() => {
        setOpenMenu(false);
        setOpenUsers(false);
      }}
      className="flex flex-col w-full h-full min-h-[700px] pt-5 px-5 items-center justify-between relative"
    >
      <h1 className="text-white fixed top-10 bg-gray-700 p-2 w-full">
        {toUser?.email}
      </h1>
      {query.isSuccess && (
        <div className="flex flex-col w-full space-y-2 mb-[85px] overflow-scroll">
          {currentConversation?.messages.map((m) => (
            <>
              <div
                key={m.id}
                className={`w-full flex ${
                  m.from !== fromEmail ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  key={m.id}
                  className={`rounded px-5 py-2 w-fit max-w-[275px] ${
                    m.from !== fromEmail ? "bg-white" : "bg-red-500"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            </>
          ))}
        </div>
      )}

      <form
        className="fixed w-full flex bottom-0 p-2 bg-gradient-to-r from-gray-800 to-gray-600"
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage();
        }}
      >
        <textarea
          id="message"
          onChange={(e) => setMessage(e.target.value)}
          value={message ? message : ""}
          placeholder="Type here..."
          className="px-2 mr-2 min-h-[50px] max-h-[100px] w-full bg-gray-500 outline-none rounded"
        ></textarea>
        <button className="px-3 rounded-full bg-white" type="submit">
          <ArrowUpIcon height="20px" />
        </button>
      </form>
      {mutation.error && <p>Something went wrong! {mutation.error.message}</p>}
    </div>
  );
}
