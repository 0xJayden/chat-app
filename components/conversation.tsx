import { useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { User, Conversation, Session, Message } from "@prisma/client";
import { ArrowUpIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface ConversationWindowInterface {
  toUser:
    | {
        id: string;
        email: string | null;
        name: string | null;
        sessions: Session[];
      }
    | undefined;

  convoId: number;
  fromEmail: string;
}

export default function ConversationWindow({
  toUser,
  convoId,
  fromEmail,
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
      if (data.conversation?.recentSender !== fromEmail) readMessage();
    },
    refetchInterval: 2000,
    enabled: convoId > 0,
  });
  const { data: profile, refetch: refetchProfile } = trpc.useQuery([
    "get-profile",
    { fromEmail },
  ]);

  const read = trpc.useMutation(["read"]);

  const readMessage = () => {
    read.mutate({ convoId });
  };

  const mutation = trpc.useMutation(["send-message"], {
    onSuccess: async () => {
      await query.refetch();
      refetchProfile();
    },
  });

  const sendMessage = async () => {
    if (!message || !fromEmail || !convoId || !profile) return;

    const totalMessagesSent = profile.profile?.messagesSent;

    let amount;

    if (totalMessagesSent) {
      amount = totalMessagesSent + 1;
    } else {
      amount = 1;
    }

    mutation.mutate({ message, fromEmail, convoId, amount });

    setMessage(null);
  };

  // const newLine = () => {
  //   document.addEventListener("keydown", (e) => {});
  // };

  useEffect(scrollToBottom, [currentConversation]);

  return (
    <div className="sm:w-full h-screen bg-gradient-to-r from-gray-800 to-gray-600 sm:overflow-scroll">
      <div className="flex flex-col min-h-[550px] h-full items-center justify-between relative pt-[90px] sm:pt-10 sm:w-full">
        {toUser?.email && (
          <div className="text-white flex justify-center fixed sm:sticky sm:mb-5 top-10 bg-gray-700 p-2 w-full">
            {/* <div className="h-6 w-6 mr-2 overflow-hidden rounded-full">
            {!toUser?.image ? (
              <p>
                <UserCircleIcon className="h-6" />
              </p>
            ) : (
              <img src={toUser.image} />
            )}
          </div> */}
            Conversation with {toUser?.name ? toUser.name : toUser?.email}
          </div>
        )}
        {query.isLoading && <div>Loading...</div>}
        {query.isSuccess && (
          <div className="flex flex-col w-full space-y-2 px-5 bg-gradient-to-r from-gray-800 to-gray-600">
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
          className="w-full flex bottom-0 p-2 bg-gradient-to-r from-gray-800 to-gray-600 sticky"
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
        {mutation.error && (
          <p>Something went wrong! {mutation.error.message}</p>
        )}
      </div>
    </div>
  );
}
