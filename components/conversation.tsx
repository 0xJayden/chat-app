import { NextSession } from "../utils/utils";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { User, Conversation, Session, Message } from "@prisma/client";
import { ArrowUpIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface ConversationWindowInterface {
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
  refetchUsers2: () => Promise<void>;
}

export default function ConversationWindow({
  session,
  toUser,
  fromUser,
  convoId,
  fromEmail,
  setOpenMenu,
  setOpenUsers,
  refetchUsers2,
}: ConversationWindowInterface) {
  const [message, setMessage] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<
    | (Conversation & {
        messages: Message[];
        users: User[];
      })
    | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const query = trpc.useQuery(["get-conversation", { convoId }], {
    onSuccess(data) {
      setCurrentConversation(data.conversation);
    },
    refetchInterval: 1200,
    refetchOnWindowFocus: false,
  });

  const mutation = trpc.useMutation(["send-message"], {
    onSuccess() {
      query.refetch();
      refetchUsers2();
    },
  });

  const addOneToMessage = trpc.useMutation(["add-1-to-messages"]);

  const sendMessage = async () => {
    if (!message || !session?.user || !fromEmail || !convoId || !fromUser)
      return;

    mutation.mutate({ message, fromEmail, convoId });

    if (!fromUser.messagesSent) {
      const amount = 1;
      addOneToMessage.mutate({ fromEmail, amount });
    } else {
      const amount = fromUser.messagesSent + 1;

      addOneToMessage.mutate({ fromEmail, amount });
    }

    setMessage(null);
  };

  // const newLine = () => {
  //   document.addEventListener("keydown", (e) => {});
  // };

  useEffect(scrollToBottom, [currentConversation]);

  return (
    <div
      onClick={() => {
        setOpenMenu(false);
        setOpenUsers(false);
      }}
      className="flex overflow-hidden flex-col w-full h-full min-h-[700px] pt-5 px-5 items-center justify-between relative"
    >
      {toUser?.email && (
        <>
          <h1 className="text-white flex justify-center fixed top-10 bg-gray-700 p-2 w-full">
            <div className="h-6 w-6 mr-2 overflow-hidden rounded-full">
              {!toUser?.image ? (
                <p>
                  <UserCircleIcon className="h-6" />
                </p>
              ) : (
                <img src={toUser.image} />
              )}
            </div>
            {toUser?.name ? toUser.name : toUser?.email}
          </h1>
        </>
      )}
      {query.isLoading && <div>Loading...</div>}
      {query.isSuccess && (
        <div className="flex flex-col w-full space-y-2 mb-[85px] overflow-scroll">
          {currentConversation?.messages.map((m) => (
            <div key={m.id}>
              <div
                className={`w-full flex ${
                  m.from !== fromEmail ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`rounded px-5 py-2 max-w-[275px] ${
                    m.from !== fromEmail ? "bg-gray-500" : "bg-red-700"
                  }`}
                >
                  <p className="overflow-auto">{m.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        className="fixed w-full flex bottom-0 p-2 bg-gradient-to-r from-gray-800 to-gray-600"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <textarea
          onKeyDown={(e) => {
            if (e.shiftKey && e.key === "Enter") return;

            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          id="desktop-message"
          onChange={(e) => setMessage(e.target.value)}
          value={message ? message : ""}
          placeholder="Type here..."
          className="hidden sm:inline px-2 mr-2 min-h-[50px] max-h-[100px] w-full bg-gray-500 outline-none rounded"
        />
        <textarea
          id="message"
          onChange={(e) => setMessage(e.target.value)}
          value={message ? message : ""}
          placeholder="Type here..."
          className="sm:hidden px-2 mr-2 min-h-[50px] max-h-[100px] w-full bg-gray-500 outline-none rounded"
        />
        <button className="px-3 rounded-full bg-gray-200" type="submit">
          <ArrowUpIcon className="text-gray-600" height="20px" />
        </button>
      </form>
      {mutation.error && <p>Something went wrong! {mutation.error.message}</p>}
    </div>
  );
}
