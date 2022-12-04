import Layout from "./layout";
import Users from "../components/users";
import Conversations from "../components/conversations";
import ConversationWindow from "../components/conversation";
import Popup from "../components/popup";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";
import { Session } from "@prisma/client";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";

export default function Chat() {
  const router = useRouter();

  const [fromEmail, setFromEmail] = useState<string>("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [convoId, setConversationId] = useState<number>(0);
  const [name, setName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [ids, setIds] = useState<Array<number>>([]);
  const [toUser, setToUser] = useState<
    | {
        id: string;
        email: string | null;
        name: string | null;
        sessions: Session[];
      }
    | undefined
  >();

  const { data: session, status } = useSession();

  const { data: profile } = trpc.useQuery(["get-profile", { fromEmail }], {
    onSuccess: () => setProfileLoaded(true),
  });

  useEffect(() => {
    if (session && session.user?.email) {
      setFromEmail(session.user.email);
    }
    if (!session && status !== "loading") {
      router.push("/auth/signIn");
    }
  }, [session]);

  if (status === "loading") return "loading...";

  return (
    <Layout>
      <Popup name={name} setName={setName} ids={ids} setIds={setIds} />
      <Navbar
        setOpenMenu={setOpenMenu}
        openMenu={openMenu}
        setOpenUsers={setOpenUsers}
        openUsers={openUsers}
      />
      {convoId === 0 && (
        <div className="w-full flex justify-center items-end pt-14">
          <h1 className="text-white">
            Welcome {profile?.profile?.name ? profile.profile.name : fromEmail}!
          </h1>
        </div>
      )}
      <div className="sm:flex sm:justify-between">
        <Conversations
          fromEmail={fromEmail}
          openMenu={openMenu}
          setConversationId={setConversationId}
          setToUser={setToUser}
          setOpenMenu={setOpenMenu}
        />
        {convoId !== 0 ? (
          <ConversationWindow
            toUser={toUser}
            convoId={convoId}
            fromEmail={fromEmail}
          />
        ) : (
          <div className="p-2 m-5 border border-gray-400 rounded sm:hidden">
            Create a conversation with a user by opening the{" "}
            <span className="font-normal">{`'User Menu'`}</span> on the right
            and selecting a user.<br></br>
            <div className="w-full text-center italic">or</div>
            Select an exisiting conversation by opening the{" "}
            <span className="font-normal">{`'Conversation Menu'`}</span> on the
            left.
          </div>
        )}
        <Users
          setToUser={setToUser}
          openUsers={openUsers}
          setOpenUsers={setOpenUsers}
          setConversationId={setConversationId}
          fromEmail={fromEmail}
          setIds={setIds}
          setName={setName}
          name={name}
          profileLoaded={profileLoaded}
          setUsersLoaded={setUsersLoaded}
          usersLoaded={usersLoaded}
        />
      </div>
    </Layout>
  );
}
