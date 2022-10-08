import { initTRPC } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { prisma } from "../../../utils/prisma";

export const t = initTRPC.create();

export const appRouter = t.router({
  createConversation: t.procedure
    .input(
      z.object({
        toUserId: z.string(),
        fromUserId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: input.toUserId }, { id: input.fromUserId }],
          },
        },
      });

      return { success: true, conversation };
    }),
  getConversation: t.procedure
    .input(
      z.object({
        convoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: input.convoId,
        },
        include: {
          messages: true,
          users: true,
        },
      });

      return {
        conversation,
      };
    }),
  sendMessage: t.procedure
    .input(
      z.object({
        fromEmail: z.string(),
        message: z.string(),
        convoId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // const user = await prisma.user.findFirst({
      //   where: {
      //     email: input.fromEmail,
      //   },
      //   include: {
      //     conversations: true,
      //   },
      // });

      // const id = user?.conversations[0].id;

      // const toUser = await prisma.user.findFirst({
      //   where: {
      //     email: input.toEmail,
      //   },
      // });

      // if (!user || !toUser?.email) return;

      const message = await prisma.message.create({
        data: {
          from: input.fromEmail,
          message: input.message,
          conversation: { connect: { id: input.convoId } },
        },
      });

      return { success: true, message };
    }),
  getConversations: t.procedure
    .input(
      z.object({
        fromEmail: z.string(),
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: input.fromEmail,
        },
        include: {
          conversations: {
            include: {
              messages: true,
            },
          },
        },
      });

      if (!user) return;

      const conversations = user.conversations;

      return {
        conversations,
      };
    }),
  getUsers: t.procedure.query(async () => {
    const users = await prisma.user.findMany({
      include: {
        sessions: true,
        conversations: {
          include: {
            messages: true,
            users: true,
          },
        },
      },
    });
    return {
      users,
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
