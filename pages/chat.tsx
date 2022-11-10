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
  const [openMenu, setOpenMenu] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [convoId, setConversationId] = useState<number>(0);
  const [openHi, setOpenHi] = useState(false);
  const [popupCoins, setPopupCoins] = useState(false);
  const [popup, setPopup] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
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
  const { data: users, refetch: refetchUsers } = trpc.useQuery(["get-users"]);
  const { data: profile, refetch: refetchProfile } = trpc.useQuery([
    "get-profile",
    { fromEmail },
  ]);

  const {
    data: conversations,
    isSuccess,
    isLoading,
    refetch: refetchConversations,
  } = trpc.useQuery(["get-conversations", { fromEmail }], {
    onError(err) {
      console.log(err, "err");
    },
    refetchInterval: 3000,
  });

  const callRefetchUsers = async () => {
    await refetchUsers();
    setOpenHi(true);
    setPopup(true);
    setTimeout(() => setOpenHi(false), 3000);
  };

  const callRefetchUsersCoins = async () => {
    await refetchUsers();
    setPopupCoins(true);
    setTimeout(() => setPopupCoins(false), 3000);
    setTimeout(() => setPopup(false), 3000);
  };

  useEffect(() => {
    if (session && session.user?.email) {
      setFromEmail(session.user.email);
    }
    if (!session) {
      router.push("/");
    }
  }, [users]);

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
          welcome{" "}
          {profile?.profile?.name ? profile.profile.name : session?.user?.email}
        </h1>
      </div>
      <Conversations
        fromEmail={fromEmail}
        openMenu={openMenu}
        setConversationId={setConversationId}
        setToUser={setToUser}
        setOpenMenu={setOpenMenu}
        conversations={conversations}
        refetchConversations={refetchConversations}
        isLoading={isLoading}
        isSuccess={isSuccess}
        setIsOpened={setIsOpened}
        isOpened={isOpened}
      />
      <ConversationWindow
        session={session}
        toUser={toUser}
        convoId={convoId}
        fromEmail={fromEmail}
        setOpenMenu={setOpenMenu}
        setOpenUsers={setOpenUsers}
        refetchUsers={refetchUsers}
        profile={profile}
        setIsOpened={setIsOpened}
        isOpened={isOpened}
      />
      <Users
        session={session}
        users={users}
        setToUser={setToUser}
        openUsers={openUsers}
        setOpenUsers={setOpenUsers}
        setConversationId={setConversationId}
        callRefetchUsers={callRefetchUsers}
        fromEmail={fromEmail}
        openHi={openHi}
        callRefetchUsersCoins={callRefetchUsersCoins}
        popupCoins={popupCoins}
        popup={popup}
        refetchProfile={refetchProfile}
        conversations={conversations}
        profile={profile}
      />
    </Layout>
  );
}
