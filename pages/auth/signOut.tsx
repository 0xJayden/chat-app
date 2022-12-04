import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignOut() {
  const router = useRouter();
  return (
    <div className="inset-0 fixed flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-600 text-gray-100">
      <h1 className="absolute top-10 font-semibold text-[50px]">Chat App</h1>
      <div className="flex flex-col justify-center border w-[300px] rounded px-4 py-2">
        <h1 className="text-center text-xl">
          Are you sure you want to sign out?
        </h1>
        <div className="flex justify-between mt-10">
          <button
            onClick={async () => await signOut({ callbackUrl: "/auth/signIn" })}
            className="border px-2 py-1 rounded bg-white text-gray-700"
          >
            Yes
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="border px-2 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
