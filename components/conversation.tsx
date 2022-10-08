import { NextSession } from "../utils/utils";
import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { User, Conversation, Session, Message } from "@prisma/client";

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
}

export default function ConversationWindow({
  openConversation,
  session,
  toUser,
  fromUser,
}: ConversationWindowInterface) {
  const [message, setMessage] = useState<string | null>(null);
  const [convoId, setConversationId] = useState<number>(0);

  const { data: conversation, refetch } = trpc.getConversation.useQuery({
    convoId,
  });

  const mutation = trpc.sendMessage.useMutation();

  const sendMessage = async () => {
    if (!message || !session?.user) return;
    const fromEmail = fromUser?.email;
    console.log("working2", fromEmail, convoId);
    if (!fromEmail || !convoId) return;
    mutation.mutate({ message, fromEmail, convoId });
    setMessage(null);
    setTimeout(() => refetch(), 400);
  };

  useEffect(() => {
    if (!toUser) return;
    const convo = fromUser?.conversations.find((c) =>
      c.users.find((u) => u.id === toUser.id)
    );
    const id = convo?.id;
    console.log("working1", convo, fromUser?.conversations);
    if (!id) return;
    setConversationId(id);
  }, [openConversation]);

  return (
    <div className="flex flex-col w-full h-full pt-10 px-5 items-center justify-between relative">
      <h1>Conversation</h1>
      {openConversation && (
        <div className="flex flex-col w-full space-y-2 mb-20">
          {conversation?.conversation?.messages.map((m) => (
            <div
              key={m.id}
              className={`w-full flex ${
                m.from !== toUser?.email ? "justify-start" : "justify-end"
              }`}
            >
              <div
                key={m.id}
                className={`rounded px-5 py-2 w-fit ${
                  m.from !== toUser?.email ? "bg-white" : "bg-red-500"
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        className="flex w-full absolute bottom-0 border-t p-2"
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
          className="px-2 mr-2 min-h-[50px] max-h-[100px] w-full bg-gray-500 outline-none"
        ></textarea>
        <button className="border p-2" type="submit">
          Send
        </button>
      </form>
      {mutation.error && <p>Something went wrong! {mutation.error.message}</p>}
    </div>
  );
}
