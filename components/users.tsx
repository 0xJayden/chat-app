import {
  BaseSyntheticEvent,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { trpc } from "../utils/trpc";
import { Conversation, Session } from "@prisma/client";
import {
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Compressor from "compressorjs";
import Moment from "react-moment";
interface UsersInterface {
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
  openUsers: boolean;
  setOpenUsers: Dispatch<SetStateAction<boolean>>;
  setConversationId: Dispatch<SetStateAction<number>>;
  fromEmail: string;
  openHi: boolean;
  popupCoins: boolean;
  popup: boolean;
  setOpenHi: Dispatch<SetStateAction<boolean>>;
  setPopup: Dispatch<SetStateAction<boolean>>;
  setPopupCoins: Dispatch<SetStateAction<boolean>>;
}

export default function Users({
  setToUser,
  openUsers,
  setOpenUsers,
  setConversationId,
  fromEmail,
  openHi,
  popupCoins,
  popup,
  setOpenHi,
  setPopup,
  setPopupCoins,
}: UsersInterface) {
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState("");
  const [pfp, setPfp] = useState<string>();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: users } = trpc.useQuery(["get-users"], {
    enabled: openUsers,
  });
  const { data: profile, refetch: refetchProfile } = trpc.useQuery([
    "get-profile",
    { fromEmail },
  ]);
  const { data: conversations } = trpc.useQuery(
    ["get-conversations", { fromEmail }],
    {
      onError(err) {
        console.log(err, "err");
      },
      refetchInterval: 3000,
      enabled: openUsers,
    }
  );

  const mutation = trpc.useMutation(["create-conversation"]);
  const setNameMutation = trpc.useMutation(["set-name"]);
  const addCoins = trpc.useMutation(["add-to-coins"]);
  const addPfp = trpc.useMutation(["add-pfp"]);

  const startConversation = (
    user:
      | {
          id: string;
          email: string | null;
          name: string | null;
          sessions: Session[];
        }
      | undefined
  ) => {
    if (!user || user.email === fromEmail) return;
    setToUser(user);

    const toUserId = user.id;
    const fromUserId = profile?.profile?.id;

    if (!fromUserId) return;

    const existingUserInConvo = conversations?.conversations.find((c) =>
      c.users.find((u) => u.email === user.email)
    );

    if (
      existingUserInConvo &&
      existingUserInConvo.users.find(
        (u: {
          id: string;
          email: string | null;
          name: string | null;
          image: string | null;
          sessions: Session[];
        }) => u.email === profile?.profile?.email
      )
    ) {
      setOpenUsers(false);
      return;
    }

    mutation.mutate(
      { toUserId, fromUserId },
      {
        onSuccess(data: { success: boolean; conversation: Conversation }) {
          setConversationId(data.conversation.id);
        },
      }
    );
    setOpenUsers(false);
  };

  const submitName = () => {
    setNameMutation.mutate(
      { fromEmail, name },
      {
        onSuccess: async () => {
          await refetchProfile();
          setOpenHi(true);
          setPopup(true);
          setTimeout(() => setOpenHi(false), 3000);
          setName("");
        },
      }
    );

    if (!profile?.profile?.coins) {
      const amount = 100;

      addCoins.mutate(
        {
          fromEmail,
          amount,
        },
        {
          onSuccess: async () => {
            await refetchProfile();
            setPopupCoins(true);
            setTimeout(() => setPopupCoins(false), 3000);
            setTimeout(() => setPopup(false), 3000);
          },
        }
      );
    } else {
      const amount = profile.profile.coins + 100;

      addCoins.mutate(
        {
          fromEmail,
          amount,
        },
        {
          onSuccess: async () => {
            await refetchProfile();
            setPopupCoins(true);
            setTimeout(() => setPopupCoins(false), 3000);
            setTimeout(() => setPopup(false), 3000);
          },
        }
      );
    }
  };

  const setProfilePicture = (e: BaseSyntheticEvent) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) return;

    if (!["image/jpeg", "image/png"].includes(selectedImage.type)) return;

    const res = new Compressor(selectedImage, {
      quality: 0.8,
      width: 1000,
      height: 1000,
      resize: "cover",
      success: (res) => {
        let fileReader = new FileReader();

        fileReader.readAsDataURL(res);

        fileReader.addEventListener("load", async (e) => {
          if (
            e.target == null ||
            e.target.result == null ||
            typeof e.target.result !== "string"
          )
            return;

          const image = e.target.result;

          addPfp.mutate(
            { fromEmail, image },
            {
              onSuccess: async () => {
                await refetchProfile();
              },
            }
          );

          setPfp(e.target.result);
        });
      },
    });
  };

  return (
    <>
      {popup && (
        <div
          className={`sticky space-y-2 flex flex-col justify-center items-center z-30 animate-popup`}
        >
          {openHi && (
            <div
              className={`sticky flex justify-center items-center z-30 animate-separate`}
            >
              <div
                className={`flex flex-col justify-between items-center w-[200px] h-[50px] bg-green-500 rounded p-5 text-center
          `}
              >
                <h1>Hi, {profile?.profile?.name}</h1>
              </div>
            </div>
          )}
          {popupCoins && (
            <div
              className={`sticky flex justify-center items-center z-30 animate-separate`}
            >
              <div
                className={`flex flex-col justify-between items-center w-[200px] h-[50px] bg-green-500 rounded p-5 text-center
          `}
              >
                <h1>+100 coins {profile?.profile?.coins}</h1>
              </div>
            </div>
          )}
        </div>
      )}
      {openProfile && (
        <div className="fixed flex inset-0 justify-center items-center z-20 backdrop-brightness-50 backdrop-blur-sm">
          <div className="flex flex-col space-y-3 text-center border border-gray-500 rounded w-[350px] p-2">
            <XMarkIcon
              onClick={() => setOpenProfile(false)}
              className="cursor-pointer absolute rounded-full transition-all duration-200 ease-out hover:bg-red-500"
              height="15px"
            />
            <h1 className="font-normal text-lg">Profile</h1>
            <p>
              Current name:{" "}
              {profile?.profile?.name ? profile.profile.name : "None"}
            </p>
            <input
              value={name ? name : ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="rounded outline-none p-2 text-gray-700"
            />
            <button
              onClick={() => submitName()}
              className="border border-gray-500 rounded py-2 px-4"
            >
              Set Name
            </button>
            <div className="flex justify-center">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="overflow-hidden shadow-md bg-white ml-4 h-[90px] sm:h-[125px] w-[90px] sm:w-[125px] rounded-full border cursor-pointer hover:opacity-70"
              >
                <input
                  className="text-xs ml-8 w-1/2"
                  required
                  type="file"
                  name="photo"
                  id="photo"
                  onChange={setProfilePicture}
                  ref={imageInputRef}
                  hidden
                ></input>
                {pfp ? (
                  <img src={pfp} />
                ) : (
                  <div className="flex h-full justify-center items-center">
                    <UserIcon className="h-20 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <button className="border border-gray-500 rounded py-2 px-4">
              Set Photo
            </button>
            <h1 className="font-normal">Stats</h1>
            <div className="text-start flex justify-between">
              <div>
                <p>Messages sent: </p>
                <p>Age: </p>
                <p>Coins: </p>
              </div>
              <div>
                <p>
                  {profile?.profile?.messagesSent
                    ? profile.profile.messagesSent
                    : 0}
                </p>
                {profile?.profile ? (
                  <Moment fromNow ago>
                    {profile.profile.timeCreated}
                  </Moment>
                ) : null}
                <p>{profile?.profile?.coins ? profile.profile.coins : 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`fixed top-10 inset-0 flex justify-start z-10 items-center ${
          openUsers
            ? "opacity-100 transition duration-500 ease-out"
            : "opacity-0 translate-x-full transition duration-500 ease-out"
        }`}
      >
        <div
          onClick={() => {
            setOpenUsers(false);
          }}
          className="h-full w-full"
        ></div>
        <div className="flex flex-col h-full min-w-[250px] border-l border-gray-500 bg-gray-700">
          <h1 className="text-lg font-normal p-2">Account</h1>

          <div
            onClick={() => setOpenProfile(true)}
            className="flex w-full text-center p-2 border-b border-gray-500 cursor-pointer hover:bg-gray-500 transition-all duration-300 ease-out"
          >
            <div className="h-6 w-6 overflow-hidden rounded-full mr-2">
              {!profile?.profile?.image ? (
                <UserCircleIcon className="h-6" />
              ) : (
                <img src={profile.profile.image} />
              )}
            </div>
            <p>{profile?.profile?.name ? profile.profile.name : fromEmail}</p>
          </div>
          <h1 className="pt-5 px-2 pb-3 text-lg font-normal">Users</h1>
          <>
            <h1 className="text-green-500 p-2">Online</h1>
            {users?.users.map(
              (u) =>
                u.email !== fromEmail &&
                u.sessions.length > 0 && (
                  <div
                    className="cursor-pointer border-b border-gray-500 w-full hover:bg-gray-500 transition-all duration-300 ease-out"
                    key={u.email}
                  >
                    <div
                      className="p-2 flex"
                      onClick={() => {
                        if (!u) return;
                        startConversation(u);
                      }}
                    >
                      {u.image ? (
                        <div className="h-6 w-6 overflow-hidden rounded-full">
                          <img src={u.image} />
                        </div>
                      ) : (
                        <UserCircleIcon className="h-6" />
                      )}
                      <p className="ml-2">{u.name ? u.name : u.email}</p>
                    </div>
                  </div>
                )
            )}
          </>
          <>
            <h1 className="text-red-500 pt-5 px-2">Offline</h1>
            {users?.users.map(
              (u) =>
                u.email !== fromEmail &&
                u.sessions.length === 0 && (
                  <div
                    className="cursor-pointer border-b border-gray-500 w-full hover:bg-gray-500 transition-all duration-300 ease-out"
                    key={u.email}
                  >
                    <div
                      className="p-2 flex"
                      onClick={() => {
                        if (!u) return;
                        startConversation(u);
                      }}
                    >
                      {u.image ? (
                        <img className="h-6 w-6 rounded-full" src={u.image} />
                      ) : (
                        <UserCircleIcon className="h-6" />
                      )}
                      <p className="ml-2">{u.name ? u.name : u.email}</p>
                    </div>
                  </div>
                )
            )}
          </>
        </div>
      </div>
    </>
  );
}
