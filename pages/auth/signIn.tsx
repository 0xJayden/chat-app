import { GetServerSideProps } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
  signIn,
  useSession,
} from "next-auth/react";
import { useRouter } from "next/router";
import { BaseSyntheticEvent, useRef } from "react";
import Layout from "../layout";

export default function SignIn({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  const { data: session } = useSession();

  const router = useRouter();

  if (session) router.push("/chat");

  const emailRef = useRef<HTMLInputElement>(null);

  const submitHandler = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    const emailInput = emailRef.current?.value;

    if (!emailInput) return;

    await signIn("email", {
      email: emailInput,
      callbackUrl: "/chat",
    });
  };

  return (
    <Layout>
      <div className="inset-0 fixed flex items-center justify-center">
        <h1 className="absolute top-10 font-semibold text-[50px]">Chat App</h1>
        <div className="flex flex-col justify-center border w-[300px] rounded px-4 py-2">
          <form onSubmit={submitHandler} className="flex flex-col space-y-2">
            <input
              className="rounded px-2 py-1 text-gray-700"
              type="text"
              placeholder="email@example.com"
              ref={emailRef}
            />
            <button type="submit" className="border px-2 py-1 rounded">
              Sign in with Email
            </button>
          </form>
          <div className="flex justify-between my-4 w-full">
            <div className="">____________</div>
            <p>or</p>
            <div className="">____________</div>
          </div>
          <div className="space-y-2 flex flex-col">
            {providers
              ? Object.values(providers).map(
                  (p) =>
                    p.name !== "Email" && (
                      <button
                        key={p.id}
                        onClick={async () =>
                          await signIn(p.id, { callbackUrl: "/chat" })
                        }
                        className="border rounded px-2 py-1"
                      >
                        Sign in with {p.name}
                      </button>
                    )
                )
              : "oops"}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
};
