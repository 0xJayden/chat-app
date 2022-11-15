import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "loading") return "loading...";

  if (session) {
    router.push("/chat");
  } else {
    router.push("auth/signIn");
  }

  return (
    <Layout>
      <Head>
        <title>Chat App</title>
        <meta name="description" content="A cool chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Layout>
  );
}
