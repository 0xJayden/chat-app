import { prisma } from "../utils/prisma";

export default function Users() {
  // const users = prisma.user.findMany()
  return (
    <div className="flex justify-center p-5 border-l h-full min-w-[150px]">
      <h1>Users</h1>
    </div>
  );
}
