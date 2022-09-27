import Layout from "./layout";
import Users from "../components/users";
import Conversations from "../components/conversations";
import Conversation from "../components/conversation";

export default function Chat() {
  return (
    <Layout>
      <div className="flex justify-center h-screen items-center">
        <div className="flex border rounded w-[1000px] h-[600px]">
          <div className="flex w-full">
            <Conversations />
            <Conversation />
            <Users />
          </div>
        </div>
      </div>
    </Layout>
  );
}
