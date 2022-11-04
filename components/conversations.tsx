import { Dispatch, SetStateAction, useEffect } from "react";
import { Conversation, Message, Session, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ConversationsInterface {
  fromEmail: string;
  openMenu: boolean;
  setConversationId: Dispatch<SetStateAction<number>>;
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
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
}

export default function Conversations({
  fromEmail,
  openMenu,
  setConversationId,
  setFromUser,
  setToUser,
  setOpenMenu,
}: ConversationsInterface) {
  const { data: session } = useSession();

  const {
    data: conversations,
    isSuccess,
    refetch,
  } = trpc.useQuery(["get-conversations", { fromEmail }], {
    onError(err) {
      console.log(err, "err");
    },
  });

  const mutation = trpc.useMutation(["remove-user"], {
    onSuccess() {
      refetch();
    },
  });

  const removeSelfFromConvo = async (id: number) => {
    const convoId = id;
    const user = fromEmail;
    mutation.mutate({ user, convoId });
  };

  useEffect(() => {
    refetch();
  }, [openMenu]);

  return (
    <div
      className={`flex flex-col fixed left-0 top-10 z-10 items-center border-r h-full bg-gray-500 max-w-[250px] ${
        openMenu
          ? "opacity-100 transition duration-500 ease-out"
          : "opacity-0 -translate-x-full transition duration-500 ease-out"
      }`}
    >
      <h1 className="p-5">Conversations</h1>
      {isSuccess && (
        <div className="flex flex-col w-full overflow-scroll">
          {conversations?.conversations.map((c) => (
            <div className="cursor-pointer p-2 border-b" key={c.id}>
              <XMarkIcon
                onClick={() => removeSelfFromConvo(c.id)}
                height="11px"
                className="cursor-pointer rounded-full hover:bg-white"
              />
              <p
                onClick={() => {
                  setConversationId(c.id);
                  if (c.users[0].email === fromEmail) {
                    setFromUser(c.users[0]);
                    setToUser(c.users[1]);
                  } else {
                    setFromUser(c.users[1]);
                    setToUser(c.users[0]);
                  }
                  setOpenMenu(false);
                }}
              >
                {c.users.find((u) => u.email !== fromEmail)
                  ? c.users.find((u) => u.email !== fromEmail)?.email
                  : `No Users Left`}
              </p>
              <p className="text-gray-400 line-clamp-2 text-ellipsis text-sm">
                {c.messages[c.messages.length - 1]?.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
