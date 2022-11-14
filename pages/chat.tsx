import Layout from "./layout";
import Users from "../components/users";
import Conversations from "../components/conversations";
import ConversationWindow from "../components/conversation";
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
  const [openHi, setOpenHi] = useState(false);
  const [popupCoins, setPopupCoins] = useState(false);
  const [popup, setPopup] = useState(false);
  const [toUser, setToUser] = useState<
    | {
        id: string;
        email: string | null;
        name: string | null;
        sessions: Session[];
      }
    | undefined
  >();

  const { data: session } = useSession();
  const { data: profile } = trpc.useQuery(["get-profile", { fromEmail }]);

  useEffect(() => {
    if (session && session.user?.email) {
      setFromEmail(session.user.email);
    }
    if (!session) {
      router.push("/");
    }
  }, [session]);

  return (
    <Layout>
      <Navbar
        setOpenMenu={setOpenMenu}
        openMenu={openMenu}
        setOpenUsers={setOpenUsers}
        openUsers={openUsers}
      />
      <div className="w-full flex justify-center items-end h-20">
        <h1 className="text-white">
          Welcome {profile?.profile?.name ? profile.profile.name : fromEmail}!
        </h1>
      </div>
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
        <p className="p-2 m-5 border border-gray-400 rounded">
          Create a conversation with a user by opening the{" "}
          <span className="font-normal">'User Menu'</span> on the right and
          selecting a user.<br></br>
          <div className="w-full text-center italic">or</div>
          Select an exisiting conversation by opening the{" "}
          <span className="font-normal">'Conversation Menu'</span> on the left.
        </p>
      )}
      <Users
        setToUser={setToUser}
        openUsers={openUsers}
        setOpenUsers={setOpenUsers}
        setConversationId={setConversationId}
        fromEmail={fromEmail}
        openHi={openHi}
        popupCoins={popupCoins}
        popup={popup}
        setOpenHi={setOpenHi}
        setPopup={setPopup}
        setPopupCoins={setPopupCoins}
      />
    </Layout>
  );
}
