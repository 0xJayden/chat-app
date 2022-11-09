import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Conversation, Message, Session, User } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "react-query";
import { TRPCClientErrorLike } from "@trpc/client";

interface ConversationsInterface {
  fromEmail: string;
  openMenu: boolean;
  setConversationId: Dispatch<SetStateAction<number>>;
  setToUser: Dispatch<
    SetStateAction<
      | {
          id: string;
          email: string | null;
          name: string | null;
          sessions: Session[];
        }
      | undefined
    >
  >;
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  conversations:
    | {
        conversations: {
          recentMessage: string | null;
          recentSender: string | null;
          timeOfRecentMessage: string | null;
          read: boolean | null;
          users: {
            id: string;
            email: string | null;
            name: string | null;
            sessions: Session[];
          }[];
          id: number;
        }[];
      }
    | undefined;
  refetchConversations: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<
    QueryObserverResult<
      | {
          conversations: {
            recentMessage: string | null;
            users: {}[];
            id: number;
          }[];
        }
      | undefined,
      TRPCClientErrorLike<any>
    >
  >;
  isLoading: boolean;
  isSuccess: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  isOpened: boolean;
}

export default function Conversations({
  fromEmail,
  openMenu,
  setConversationId,
  setToUser,
  setOpenMenu,
  conversations,
  refetchConversations,
  isLoading,
  isSuccess,
  setIsOpened,
  isOpened,
}: ConversationsInterface) {
  const [openDeleteConvo, setOpenDeleteConvo] = useState(false);
  const [convoId, setConvoId] = useState<number>();

  const mutation = trpc.useMutation(["remove-user"], {
    onSuccess() {
      refetchConversations();
    },
  });

  const removeSelfFromConvo = async (id: number) => {
    const convoId = id;
    const user = fromEmail;
    mutation.mutate({ user, convoId });
  };

  useEffect(() => {
    refetchConversations();
  }, [openMenu]);

  return (
    <>
      {openDeleteConvo && (
        <div className="fixed flex inset-0 justify-center items-center z-20 backdrop-brightness-75">
          <div className="flex flex-col justify-between text-center border border-gray-500 rounded h-[150px] w-[250px] p-2 bg-gray-700">
            <p className="text-gray-300">
              Are you sure you want to remove the conversation?
            </p>
            <div className="flex justify-between px-4">
              <button
                onClick={() => setOpenDeleteConvo(false)}
                className="border border-gray-500 rounded py-2 px-4"
              >
                No
              </button>
              <button
                onClick={() => {
                  if (!convoId) return;
                  removeSelfFromConvo(convoId);
                }}
                className="border border-gray-500 rounded py-2 px-4 bg-gray-200 text-gray-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col fixed left-0 top-10 z-10 items-center border-r border-gray-500 h-full bg-gray-700 max-w-[250px] ${
          openMenu
            ? "opacity-100 transition duration-500 ease-out"
            : "opacity-0 -translate-x-full transition duration-500 ease-out"
        }`}
      >
        <h1 className="p-2 text-lg font-normal">
          {conversations?.conversations.length} Conversations
        </h1>
        {isLoading && !isSuccess && <div>Loading...</div>}
        {isSuccess && (
          <div className="flex flex-col w-full overflow-scroll">
            {conversations?.conversations.map((c) => (
              <div className="border-b border-gray-500" key={c.id}>
                <div className="flex justify-between items-center">
                  <XMarkIcon
                    onClick={() => {
                      setConvoId(c.id);
                      setOpenDeleteConvo(true);
                    }}
                    height="15px"
                    className="cursor-pointer rounded-full mx-2 hover:bg-red-500"
                  />
                  <div className="mr-2">
                    <p className="text-sm">{c.timeOfRecentMessage}</p>
                    {!c.read && !c.recentSender ? (
                      <p className="h-3 w-3 rounded-full bg-green-500"></p>
                    ) : null}
                  </div>
                </div>

                <div
                  className="cursor-pointer p-2 hover:bg-gray-500 transition-all duration-300 ease-out"
                  onClick={() => {
                    setConversationId(c.id);
                    setIsOpened(true);
                    setToUser(c.users.find((u) => u.email !== fromEmail));
                    setOpenMenu(false);
                  }}
                >
                  <p>
                    {c.users.find((u) => u.email !== fromEmail)
                      ? c.users.find((u) => u.email !== fromEmail)?.email
                      : `No Users Left`}
                  </p>
                  <p className="text-gray-400 line-clamp-2 text-ellipsis text-sm">
                    {c.recentMessage ? c.recentMessage : "No messages yet..."}
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
