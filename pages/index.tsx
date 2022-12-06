import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useSession } from "next-auth/react";
import Loading from "../components/Loading";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;

  if (session) {
    router.push("/chat");
  } else {
    router.push("auth/signIn");
  }

  return (
    <Layout>
      <Loading />
      <Head>
        <title>Chat App</title>
        <meta name="description" content="A cool chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Layout>
  );
}
