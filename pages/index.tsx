import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./layout";
import HomePage from "../components/home";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "loading") return "loading...";

  if (session) {
    router.push("/chat");
  }

  return (
    <Layout>
      <Head>
        <title>Chat App</title>
        <meta name="description" content="A cool chat app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomePage />
    </Layout>
  );
}

// import { trpc } from "../utils/trpc";

// export default function IndexPage() {
//   const hello = trpc.hello.useQuery({ text: "client" });
//   if (!hello.data) {
//     return <div>Loading...</div>;
//   }
//   return (
//     <div>
//       <p>{hello.data.greeting}</p>
//     </div>
//   );
// }
