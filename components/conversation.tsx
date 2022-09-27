import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

export default function Conversation() {
  const { data: session } = useSession();

  const [message, setMessage] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState<string>("");
  const [fromEmail, setFromEmail] = useState<string>("");

  useEffect(() => {
    if (session && session.user?.email) {
      setFromEmail(session.user.email);
      setToEmail(session.user.email);
    }
  }, []);

  const { data: messages, refetch } = trpc.getMessages.useQuery({ fromEmail });

  const mutation = trpc.sendMessage.useMutation();

  const sendMessage = async () => {
    if (!message || !session?.user) return;

    if (
      !fromEmail ||
      fromEmail === "undefined" ||
      toEmail === "undefined" ||
      !toEmail
    )
      return;

    mutation.mutate({ message, fromEmail, toEmail });
    setMessage(null);
    setTimeout(() => refetch(), 400);
  };

  return (
    <div className="flex flex-col w-4/5 p-5 items-center justify-between relative">
      <h1>Conversation</h1>
      <div className="flex flex-col items-end w-full space-y-2 mb-20">
        {messages?.messages?.map((m) => (
          <div key={m.id} className="bg-white px-5 rounded">
            {m.message}
          </div>
        ))}
      </div>

      <form
        className="absolute bottom-0 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage();
        }}
      >
        <textarea
          id="message"
          onChange={(e) => setMessage(e.target.value)}
          value={message ? message : ""}
          className="px-2 w-full bg-transparent border-t min-h-[50px] outline-none"
        ></textarea>
        <button className="border p-2" type="submit">
          Send
        </button>
      </form>
      {mutation.error && <p>Something went wrong! {mutation.error.message}</p>}
    </div>
  );
}
