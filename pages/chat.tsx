import Layout from "./layout";
import Users from "../components/users";
import Conversations from "../components/conversations";
import ConversationWindow from "../components/conversation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";
import { User, Conversation, Session, Message } from "@prisma/client";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";

export default function Chat() {
  const router = useRouter();

  const [fromEmail, setFromEmail] = useState<string>("");
  const [openConversation, setOpenConversation] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [convoId, setConversationId] = useState<number>(0);
  const [toUser, setToUser] = useState<
    | (User & {
        conversations: (Conversation & {
          messages: Message[];
          users: User[];
        })[];
        sessions: Session[];
      })
    | undefined
  >();
  const [fromUser, setFromUser] = useState<
    | (User & {
        conversations: (Conversation & {
          messages: Message[];
          users: User[];
        })[];
        sessions: Session[];
      })
    | undefined
  >();

  const { data: session } = useSession();
  const { data: users } = trpc.getUsers.useQuery();

  useEffect(() => {
    if (session && session.user?.email) {
      setFromEmail(session.user.email);
    }
    if (!session) {
      router.push("/");
    }
  }, []);

  return (
    <Layout>
      <Navbar
        setOpenMenu={setOpenMenu}
        openMenu={openMenu}
        setOpenUsers={setOpenUsers}
        openUsers={openUsers}
      />
      <div className="w-full flex justify-center items-end h-20">
        <h1 className="text-white">welcome {session?.user?.email}</h1>
      </div>
      <Conversations
        fromEmail={fromEmail}
        openMenu={openMenu}
        setConversationId={setConversationId}
        setFromUser={setFromUser}
        setToUser={setToUser}
        setOpenMenu={setOpenMenu}
      />
      <ConversationWindow
        session={session}
        toUser={toUser}
        fromUser={fromUser}
        convoId={convoId}
        fromEmail={fromEmail}
        setOpenMenu={setOpenMenu}
        setOpenUsers={setOpenUsers}
      />
      <Users
        session={session}
        setOpenConversation={setOpenConversation}
        users={users}
        setFromUser={setFromUser}
        setToUser={setToUser}
        openUsers={openUsers}
        setOpenUsers={setOpenUsers}
        setConversationId={setConversationId}
      />
    </Layout>
  );
}
