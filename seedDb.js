const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      id: true,
    },
  });
  //console.log("All Users --", allUsers);
  console.dir(allUsers, { depth: null });
  const allGroupsByUserId = await prisma.usersOnChats.findMany({
    where: {
      userId: 1,
      chat: {
        type: "GROUP",
      },
    },
    select: {
      chat: {
        select: {
          id: true,
          group_name: true,
          Message: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          createdAt: true,
        },
      },
    },
  });
  console.dir(allGroupsByUserId, { depth: null });
  // const globalGroup = await prisma.chat.create({
  //   data: {
  //     group_name: "Global chat",
  //     type: "GROUP",
  //     UsersChats: {
  //       createMany: {
  //         data: [
  //           { userId: 1 },
  //           { userId: 2 },
  //           { userId: 3 },
  //           { userId: 4 },
  //           { userId: 5 },
  //           { userId: 6 },
  //           { userId: 7 },
  //           { userId: 8 },
  //           { userId: 9 },
  //           { userId: 10 },
  //           { userId: 11 },
  //           { userId: 12 },
  //         ],
  //       },
  //     },
  //   },
  // });
  // const getGroupById = await prisma.chat.groupBy({
  //   by: ["type", "id"],
  // });
  // console.dir(getGroupById, { depth: null });

  // const allChats = await prisma.usersOnChats.groupBy({
  //   by: ["userId"],
  //   where: {
  //     chatId: "1f7bcd88-9ffa-444e-b41a-89508afdc1f7",
  //   },
  // });
  // console.dir(allChats, { depth: null });

  // const allPrivateChatsByUserId = await prisma.chat.findMany({
  //   where: {
  //     type: "PRIVATE",
  //     UsersChats: {
  //       some: {
  //         userId: 1,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     Message: {
  //       take: 1,
  //       select: {
  //         id: true,
  //         content: true,
  //         createdAt: true,
  //       },
  //     },
  //     UsersChats: {
  //       where: {
  //         userId: { not: 1 },
  //       },
  //       select: {
  //         userId: true,
  //       },
  //     },
  //     createdAt: true,
  //   },
  // });

  // console.dir(allPrivateChatsByUserId, { depth: null });
  // const privateChat = await prisma.chat.findUnique({
  //   where: {
  //     id: "2c56082d-2a03-4623-993f-cad2277068c0",
  //   },
  //   select: {
  //     id: true,
  //     Message: {
  //       select: {
  //         id: true,
  //         sender: {
  //           select: {
  //             id: true,
  //             username: true,
  //           },
  //         },
  //         content: true,
  //         createdAt: true,
  //       },
  //     },
  //     UsersChats: {
  //       where: {
  //         userId: { not: req.user.userId },
  //       },
  //       select: {
  //         user: {
  //           select: {
  //             username: true,
  //           },
  //         },
  //       },
  //     },
  //     createdAt: true,
  //   },
  // });

  // const allMessagesByChatId = await prisma.chat.findFirst({
  //   where: {
  //     id: "2c56082d-2a03-4623-993f-cad2277068c0",
  //   },
  //   select: {
  //     id: true,
  //     type: true,
  //     Message: {
  //       select: {
  //         senderId: true,
  //         content: true,
  //         createdAt: true,
  //       },
  //     },
  //   },
  // });
  // console.log("All msgs by chat id --", allMessagesByChatId);

  //   const messageUser1 = await prisma.message.create({
  //     data: {
  //       chatId: "2c56082d-2a03-4623-993f-cad2277068c0",
  //       senderId: 1,
  //       content: "Hello!",
  //     },
  //   });
  //   const messageUser3 = await prisma.message.create({
  //     data: {
  //       chatId: "2c56082d-2a03-4623-993f-cad2277068c0",
  //       senderId: 3,
  //       content: "Hi back!",
  //     },
  //   });
  //   const privateChat = await prisma.chat.create({
  //     data: {
  //       type: "PRIVATE",
  //     },
  //   });
  //   const addUsersToPrivateChat = await prisma.usersOnChats.createMany({
  //     data: [
  //       { userId: allUsers[0].id, chatId: privateChat.id },
  //       { userId: allUsers[2].id, chatId: privateChat.id },
  //     ],
  //   });
  //   const pChat = await prisma.chat.findMany({
  //     include: {
  //       UsersChats: {
  //         include: {
  //           user: {
  //             select: {
  //               id: true,
  //               username: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   const uChats = await prisma.usersOnChats.findMany({
  //     where: {
  //       userId: 1,
  //     },
  //   });
  //   console.log(pChat);
  //   console.log(pChat[0].UsersChats);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
