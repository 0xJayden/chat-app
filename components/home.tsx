import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";

const HomePage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="h-screen relative flex flex-col justify-center items-center text-gray-200">
      <h1 className="absolute top-10 font-semibold text-[50px]">Chat App</h1>
      {!session ? (
        <button
          className="bg-gray-800 rounded py-2 px-4"
          onClick={() => router.push("/auth/signIn")}
        >
          Sign In
        </button>
      ) : (
        <button
          className="bg-gray-800 rounded py-2 px-4"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

export default HomePage;
