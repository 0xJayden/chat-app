import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { prisma } from "../../../utils/prisma";

export const appRouter = trpc
  .router()
  .mutation("create-conversation", {
    input: z.object({
      toUserId: z.string(),
      fromUserId: z.string(),
    }),
    async resolve({ input }) {
      const conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: input.toUserId }, { id: input.fromUserId }],
          },
        },
      });

      return { success: true, conversation };
    },
  })
  .query("get-conversation", {
    input: z.object({
      convoId: z.number(),
    }),
    async resolve({ input }) {
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
    },
  })
  .mutation("send-message", {
    input: z.object({
      fromEmail: z.string(),
      message: z.string(),
      convoId: z.number(),
      time: z.string(),
      amount: z.number(),
    }),
    async resolve({ input }) {
      const message = await prisma.message.create({
        data: {
          from: input.fromEmail,
          message: input.message,
          conversation: { connect: { id: input.convoId } },
        },
      });

      await prisma.conversation.update({
        where: {
          id: input.convoId,
        },
        data: {
          recentMessage: input.message,
          recentSender: input.fromEmail,
          timeOfRecentMessage: input.time,
          read: false,
        },
      });

      await prisma.user.update({
        where: { email: input.fromEmail },
        data: {
          messagesSent: input.amount,
        },
      });

      return { success: true, message };
    },
  })
  .mutation("read", {
    input: z.object({
      convoId: z.number(),
    }),
    async resolve({ input }) {
      await prisma.conversation.update({
        where: { id: input.convoId },
        data: { read: true },
      });
    },
  })
  .query("get-conversations", {
    input: z.object({
      fromEmail: z.string(),
    }),
    async resolve({ input }) {
      const user = await prisma.user.findFirst({
        where: {
          email: input.fromEmail,
        },
        select: {
          name: true,
          email: true,
          conversations: {
            select: {
              id: true,
              recentMessage: true,
              read: true,
              recentSender: true,
              timeOfRecentMessage: true,
              users: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  sessions: true,
                },
              },
            },
          },
        },
        // include: {
        //   conversations: {
        //     include: {
        //       messages: true,
        //       users: {
        //         include: {
        //           conversations: {
        //             include: {
        //               messages: true,
        //               users: true,
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
      });

      if (!user) return;

      const conversations = user.conversations;

      return {
        conversations,
      };
    },
  })
  .query("get-users", {
    async resolve() {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          sessions: true,
        },
        // include: {
        //   sessions: true,
        //   conversations: {
        //     include: {
        //       messages: true,
        //       users: true,
        //     },
        //   },
        // },
      });
      return {
        users,
      };
    },
  })
  .query("get-profile", {
    input: z.object({
      fromEmail: z.string(),
    }),
    async resolve({ input }) {
      const profile = await prisma.user.findFirst({
        where: {
          email: input.fromEmail,
        },
        select: {
          id: true,
          name: true,
          email: true,
          sessions: true,
          image: true,
          coins: true,
          messagesSent: true,
          age: true,
        },
      });
      return {
        profile,
      };
    },
  })
  .mutation("remove-user", {
    input: z.object({
      user: z.string(),
      convoId: z.number(),
    }),
    async resolve({ input }) {
      await prisma.user.update({
        where: { email: input.user },
        data: {
          conversations: {
            disconnect: { id: input.convoId },
          },
        },
      });
    },
  })
  .mutation("set-name", {
    input: z.object({
      fromEmail: z.string(),
      name: z.string(),
    }),
    async resolve({ input }) {
      await prisma.user.update({
        where: { email: input.fromEmail },
        data: {
          name: input.name,
        },
      });
    },
  })
  .mutation("add-to-coins", {
    input: z.object({
      fromEmail: z.string(),
      amount: z.number(),
    }),
    async resolve({ input }) {
      await prisma.user.update({
        where: { email: input.fromEmail },
        data: {
          coins: input.amount,
        },
      });
    },
  })
  .mutation("add-pfp", {
    input: z.object({
      fromEmail: z.string(),
      image: z.string(),
    }),
    async resolve({ input }) {
      await prisma.user.update({
        where: { email: input.fromEmail },
        data: {
          image: input.image,
        },
      });
    },
  });

// ({
//   createConversation: t.procedure
//     .input(
//       z.object({
//         toUserId: z.string(),
//         fromUserId: z.string(),
//       })
//     )
//     .mutation(async ({ input }) => {
//       const conversation = await prisma.conversation.create({
//         data: {
//           users: {
//             connect: [{ id: input.toUserId }, { id: input.fromUserId }],
//           },
//         },
//       });

//       return { success: true, conversation };
//     }),
//   getConversation: t.procedure
//     .input(
//       z.object({
//         convoId: z.number(),
//       })
//     )
//     .query(async ({ input }) => {
//       const conversation = await prisma.conversation.findFirst({
//         where: {
//           id: input.convoId,
//         },
//         include: {
//           messages: true,
//           users: true,
//         },
//       });

//       return {
//         conversation,
//       };
//     }),
//   sendMessage: t.procedure
//     .input(
//       z.object({
//         fromEmail: z.string(),
//         message: z.string(),
//         convoId: z.number(),
//       })
//     )
//     .mutation(async ({ input }) => {
//       // const user = await prisma.user.findFirst({
//       //   where: {
//       //     email: input.fromEmail,
//       //   },
//       //   include: {
//       //     conversations: true,
//       //   },
//       // });

//       // const id = user?.conversations[0].id;

//       // const toUser = await prisma.user.findFirst({
//       //   where: {
//       //     email: input.toEmail,
//       //   },
//       // });

//       // if (!user || !toUser?.email) return;

//       const message = await prisma.message.create({
//         data: {
//           from: input.fromEmail,
//           message: input.message,
//           conversation: { connect: { id: input.convoId } },
//         },
//       });

//       return { success: true, message };
//     }),
//   getConversations: t.procedure
//     .input(
//       z.object({
//         fromEmail: z.string(),
//       })
//     )
//     .query(async ({ input }) => {
//       const user = await prisma.user.findFirst({
//         where: {
//           email: input.fromEmail,
//         },
//         include: {
//           conversations: {
//             include: {
//               messages: true,
//               users: {
//                 include: {
//                   conversations: {
//                     include: {
//                       messages: true,
//                       users: true,
//                     },
//                   },
//                   sessions: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       if (!user) return;

//       const conversations = user.conversations;

//       return {
//         conversations,
//       };
//     }),
//   getUsers: t.procedure.query(async () => {
//     const users = await prisma.user.findMany({
//       include: {
//         sessions: true,
//         conversations: {
//           include: {
//             messages: true,
//             users: true,
//           },
//         },
//       },
//     });
//     return {
//       users,
//     };
//   }),
// });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
