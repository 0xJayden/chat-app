import { Dispatch, SetStateAction, useState } from "react";
import { Session } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Moment from "react-moment";
import moment from "moment";
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
}

export default function Conversations({
  fromEmail,
  openMenu,
  setConversationId,
  setToUser,
  setOpenMenu,
}: ConversationsInterface) {
  const [openDeleteConvo, setOpenDeleteConvo] = useState(false);
  const [convoId, setConvoId] = useState<number>();

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
    enabled: openMenu,
  });

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

  return (
    <>
      {openDeleteConvo && (
        <div className="fixed flex inset-0 justify-center items-center z-20 backdrop-brightness-75">
          <div className="flex flex-col justify-between text-center border border-gray-500 rounded h-[150px] w-[250px] p-2 bg-gray-700">
            <h1 className="text-gray-300">
              Are you sure you want to remove the conversation?
            </h1>
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
                  setOpenDeleteConvo(false);
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
        className={`fixed top-10 inset-0 flex justify-start z-10 items-center ${
          openMenu
            ? "opacity-100 transition duration-500 ease-out"
            : "opacity-0 -translate-x-full transition duration-500 ease-out"
        }`}
      >
        <div className="flex flex-col h-full min-w-[200px] border-r border-gray-500 bg-gray-700">
          <h1 className="p-2 text-lg font-normal">
            {conversations?.conversations.length} Conversations
          </h1>
          {isLoading && !isSuccess && <div>Loading...</div>}
          {isSuccess && (
            <div className="flex flex-col w-full overflow-scroll">
              {conversations?.conversations
                .sort(
                  (
                    { timeOfRecentMessage: previous },
                    { timeOfRecentMessage: current }
                  ) =>
                    current && previous
                      ? new Date(current).getTime() -
                        new Date(previous).getTime()
                      : 0
                )
                .map((c) => (
                  <div className="border-b border-gray-500 p-2" key={c.id}>
                    <div className="flex justify-between items-center">
                      <XMarkIcon
                        onClick={() => {
                          setConvoId(c.id);
                          setOpenDeleteConvo(true);
                        }}
                        height="15px"
                        className="cursor-pointer rounded-full hover:bg-red-500"
                      />
                      <div className="flex items-center">
                        <div className="text-sm mr-2">
                          {c.timeOfRecentMessage ? (
                            <Moment fromNow>{c.timeOfRecentMessage}</Moment>
                          ) : null}
                        </div>
                        {!c.read && c.recentSender !== fromEmail ? (
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {c.users.map((u) =>
                        u.email !== fromEmail ? (
                          <div key={u.id}>
                            {u.image ? (
                              <div className="flex h-10 w-10 overflow-hidden rounded-full">
                                <div className="">
                                  <img src={u.image} />
                                </div>
                              </div>
                            ) : (
                              <UserCircleIcon className="h-10" />
                            )}
                          </div>
                        ) : null
                      )}

                      <div
                        className="cursor-pointer p-2 w-full hover:bg-gray-500 transition-all duration-300 ease-out"
                        onClick={() => {
                          setConversationId(c.id);
                          setToUser(c.users.find((u) => u.email !== fromEmail));
                          setOpenMenu(false);
                        }}
                      >
                        <>
                          {c.users.length > 1 ? (
                            c.users.map((u) =>
                              u.email !== fromEmail ? (
                                <div key={u.id}>
                                  {u.name ? u.name : u.email}
                                </div>
                              ) : null
                            )
                          ) : (
                            <p>No users left</p>
                          )}
                        </>
                        <p className="text-gray-400 line-clamp-2 text-ellipsis text-sm">
                          {c.recentMessage
                            ? c.recentMessage
                            : "No messages yet..."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        <div
          onClick={() => {
            setOpenMenu(false);
          }}
          className="h-full w-full"
        ></div>
      </div>
    </>
  );
}
