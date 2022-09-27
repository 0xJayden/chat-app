import { initTRPC } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { prisma } from "../../../utils/prisma";

export const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(
      z
        .object({
          text: z.string().nullish(),
        })
        .nullish()
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? "world"}`,
      };
    }),
  sendMessage: t.procedure
    .input(
      z.object({
        fromEmail: z.string(),
        toEmail: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: input.fromEmail,
        },
      });

      const toUser = await prisma.user.findFirst({
        where: {
          email: input.toEmail,
        },
      });

      if (!user || !toUser?.email) return;

      const message = await prisma.message.create({
        data: {
          from: input.fromEmail,
          to: input.toEmail,
          message: input.message,
          user: { connect: { id: user.id } },
        },
      });

      return { success: true, message };
    }),
  getMessages: t.procedure
    .input(
      z.object({
        fromEmail: z.string(),
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findMany({
        where: {
          email: input.fromEmail,
        },
        include: {
          messages: true,
        },
      });

      const messages = user[0].messages;

      return {
        messages,
      };
    }),
  // getUsers: t.procedure
  // .input(
  //   z.object({

  //   })
  // )
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
