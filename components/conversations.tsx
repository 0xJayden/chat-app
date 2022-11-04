import { Dispatch, SetStateAction, useEffect, useState } from "react";
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

  const [openDeleteConvo, setOpenDeleteConvo] = useState(false);
  const [convoId, setConvoId] = useState<number>();

  const {
    data: conversations,
    isSuccess,
    isLoading,
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
    <>
      {openDeleteConvo && (
        <div className="fixed flex inset-0 justify-center items-center z-20 backdrop-brightness-75">
          <div className="flex flex-col justify-between text-center border rounded h-[150px] w-[250px] p-2 bg-gray-700">
            <p className="text-gray-300">
              Are you sure you want to remove the conversation?
            </p>
            <div className="flex justify-between px-4">
              <button
                onClick={() => setOpenDeleteConvo(false)}
                className="border rounded py-2 px-4"
              >
                No
              </button>
              <button
                onClick={() => {
                  if (!convoId) return;
                  removeSelfFromConvo(convoId);
                }}
                className="border rounded py-2 px-4 bg-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col fixed left-0 top-10 z-10 items-center border-r h-full bg-gray-700 max-w-[250px] ${
          openMenu
            ? "opacity-100 transition duration-500 ease-out"
            : "opacity-0 -translate-x-full transition duration-500 ease-out"
        }`}
      >
        <h1 className="p-2">
          {conversations?.conversations.length} Conversations
        </h1>
        {isLoading && !isSuccess && <div>Loading...</div>}
        {isSuccess && (
          <div className="flex flex-col w-full overflow-scroll">
            {conversations?.conversations.map((c) => (
              <div className="p-2 border-b" key={c.id}>
                <XMarkIcon
                  onClick={() => {
                    setConvoId(c.id);
                    setOpenDeleteConvo(true);
                  }}
                  height="15px"
                  className="cursor-pointer rounded-full hover:bg-red-500"
                />
                <div
                  className="cursor-pointer"
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
                  <p>
                    {c.users.find((u) => u.email !== fromEmail)
                      ? c.users.find((u) => u.email !== fromEmail)?.email
                      : `No Users Left`}
                  </p>
                  <p className="text-gray-400 line-clamp-2 text-ellipsis text-sm">
                    {c.messages[c.messages.length - 1]?.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
