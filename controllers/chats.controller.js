const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getPrivateChatsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const allPrivateChatsByUserId = await prisma.chat.findMany({
    where: {
      type: "PRIVATE",
      UsersChats: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
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
      UsersChats: {
        where: {
          userId: { not: req.user.userId },
        },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              profile_img_url: true,
            },
          },
        },
      },
      createdAt: true,
    },
  });
  const beautifyResponse = allPrivateChatsByUserId.map((pChat) => {
    return {
      chatId: pChat.id,
      recentMessage: pChat?.Message[0],
      contact: {
        id: pChat.UsersChats[0].user.id,
        username: pChat.UsersChats[0].user.username,
        profile_img_url: pChat.UsersChats[0].user.profile_img_url,
      },
    };
  });
  //console.dir(beautifyResponse, { depth: null });
  return res.status(200).json(beautifyResponse);
});

const getPrivateChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const privateChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    select: {
      id: true,
      Message: {
        select: {
          id: true,
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          content: true,
          createdAt: true,
        },
      },
      UsersChats: {
        // where: {
        //   userId: { not: req.user.userId },
        // },
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      createdAt: true,
    },
  });

  if (
    !privateChat.UsersChats.find(
      (userChk) => userChk.user.id === req.user.userId
    )
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to see this resource!" });
  }

  return res.status(200).json({
    chatId: privateChat.id,
    createdAt: privateChat.createdAt,
    messages: [...privateChat.Message],
    contact: {
      ...privateChat.UsersChats.filter(
        (user) => user.user.id !== req.user.userId
      )[0].user,
    },
  });
});

//TODO: check if private chat already exists
const createPrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { contactId } = req.body;

  const privChatCreated = await prisma.chat.create({
    data: {
      type: "PRIVATE",
      UsersChats: {
        createMany: { data: [{ userId }, { userId: contactId }] },
      },
    },
    select: {
      id: true,
    },
  });
  return res.status(201).json(privChatCreated);
});

// TODO: Sanitize/Escape the message recieved
const createPrivateChatMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.user;
  const { messageInput } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "no chatId received" });
  }

  if (!messageInput || messageInput.trim() === "") {
    return res.status(400).json({ message: "Message input can not be empty!" });
  }

  const addedMessage = await prisma.message.create({
    data: {
      chatId: chatId,
      senderId: userId,
      content: messageInput,
    },
    select: {
      id: true,
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
      content: true,
      createdAt: true,
    },
  });
  return res.status(201).json(addedMessage);
});

const getGroupChatsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const allGroupsByUserId = await prisma.usersOnChats.findMany({
    where: {
      userId,
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
        },
      },
    },
  });
  const beautifyResponse = allGroupsByUserId.map((gChat) => {
    return {
      groupId: gChat.chat.id,
      groupName: gChat.chat.group_name,
      recentMessage: gChat.chat?.Message[0],
    };
  });
  return res.status(200).json(beautifyResponse);
});

const getGroupCandidates = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const groupCandidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
    },
    select: {
      id: true,
      username: true,
    },
  });

  return res.status(200).json(groupCandidates);
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { group_name, group_members } = req.body;

  if (!group_name || !group_members) {
    return res.status(400).json({ message: "Missing or invalid data" });
  }

  const formattedGroupMembers = group_members.map((groupMem) => {
    return { userId: groupMem.id, isAdmin: false };
  });

  const createdGroupChat = await prisma.chat.create({
    data: {
      type: "GROUP",
      group_name,
      UsersChats: {
        createMany: {
          data: [...formattedGroupMembers, { userId, isAdmin: true }],
        },
      },
    },
  });
  return res.status(201).json(createdGroupChat);
});

const getGroupChatById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: groupId,
      type: "GROUP",
    },
    select: {
      id: true,
      group_name: true,
      Message: {
        select: {
          id: true,
          sender: {
            select: {
              id: true,
              username: true,
              profile_img_url: true,
            },
          },
          content: true,
          createdAt: true,
        },
      },
      UsersChats: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              profile_img_url: true,
            },
          },
          isAdmin: true,
        },
      },
      createdAt: true,
    },
  });

  if (!groupChat) {
    return res.status(404).json({ message: "Group chat doesn't exist" });
  }

  if (
    !groupChat.UsersChats.find((userChk) => userChk.user.id === req.user.userId)
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to view this resource!" });
  }

  return res.status(200).json({
    groupId: groupChat.id,
    groupName: groupChat.group_name,
    users: [
      ...groupChat.UsersChats.map((user) => ({
        id: user.user.id,
        username: user.user.username,
        profile_img_url: user.user.profile_img_url,
        isAdmin: user.isAdmin,
      })),
    ],
    messages: [...groupChat.Message],
    createdAt: groupChat.createdAt,
  });
});

const createGroupChatMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.user;
  const { messageInput } = req.body;

  if (!groupId) {
    return res.status(400).json({ message: "no groupId received" });
  }

  if (!messageInput || messageInput.trim() === "") {
    return res.status(400).json({ message: "Message input can not be empty!" });
  }

  const addedMessage = await prisma.message.create({
    data: {
      chatId: groupId,
      senderId: userId,
      content: messageInput,
    },
    select: {
      id: true,
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
      content: true,
      createdAt: true,
    },
  });
  return res.status(201).json(addedMessage);
});

const updateGroupChatById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.user;

  const groupExists = await prisma.chat.findUnique({
    where: {
      id: groupId,
      type: "GROUP",
    },
  });

  if (!groupExists) {
    return res
      .status(404)
      .json({ message: "Group chat doesn't exist!", groupId });
  }

  const { group_name, group_members } = req.body;

  if (!group_name || !group_members) {
    return res.status(400).json({ message: "Missing or invalid data" });
  }

  const formattedGroupMembers = group_members
    .map((groupMem) => {
      return { userId: groupMem.id, isAdmin: false };
    })
    .filter((groupMem) => groupMem.userId !== userId);

  const updatedGroupChat = await prisma.chat.update({
    where: {
      type: "GROUP",
      id: groupId,
    },
    data: {
      group_name,
      UsersChats: {
        deleteMany: {},
        createMany: {
          data: [...formattedGroupMembers, { userId, isAdmin: true }],
        },
      },
    },
  });

  return res.status(200).json(updatedGroupChat);
});

/* TODO: validate that userId is actually an admin */
const updateGroupChatAdmins = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;
  const userExistsInGroupAndAdmin = await prisma.usersOnChats.findUnique({
    where: {
      userId_chatId: { userId, chatId: groupId },
      isAdmin: true,
    },
  });
  if (!userExistsInGroupAndAdmin) {
    return res.status(400).json({
      message: "User doesn't exist in group or isn't a group admin!",
      userId,
    });
  }
  const updatedUser = await prisma.usersOnChats.update({
    where: {
      userId_chatId: { userId, chatId: groupId },
    },
    data: {
      isAdmin: !userExistsInGroup.isAdmin,
    },
  });
  return res.status(200).json(updatedUser);
});

const handleGroupChatMemberLeave = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  const userExistsInGroup = await prisma.usersOnChats.findUnique({
    where: {
      userId_chatId: { userId, chatId: groupId },
    },
  });
  if (!userExistsInGroup) {
    return res.status(404).json({ message: "User doesn't exist!", userId });
  }
  if (userExistsInGroup.isAdmin) {
    const additionalAdminsInGroup = await prisma.usersOnChats.findFirst({
      where: {
        userId: { not: userId },
        chatId: groupId,
        isAdmin: true,
      },
    });
    if (!additionalAdminsInGroup) {
      return res.status(400).json({
        message:
          "Group will be left without admins. Please assign another member as an Admin!",
        userId,
      });
    }
  }
  const groupUserLeave = await prisma.usersOnChats.delete({
    where: {
      userId_chatId: {
        chatId: groupId,
        userId,
      },
    },
  });
  return res.status(200).json(groupUserLeave);
});

const deleteGroupChatById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.user;

  const groupExists = await prisma.chat.findUnique({
    where: {
      id: groupId,
      type: "GROUP",
    },
  });

  if (!groupExists) {
    return res
      .status(404)
      .json({ message: "Group chat doesn't exist!", groupId });
  }

  const userExistsInGroup = await prisma.usersOnChats.findUnique({
    where: {
      userId_chatId: { userId, chatId: groupId },
    },
  });
  if (!userExistsInGroup) {
    return res
      .status(404)
      .json({ message: "User doesn't exist in this group!", userId });
  }
  if (userExistsInGroup.isAdmin) {
    const additionalAdminsInGroup = await prisma.usersOnChats.findFirst({
      where: {
        userId: { not: userId },
        chatId: groupId,
        isAdmin: true,
      },
    });
    if (additionalAdminsInGroup) {
      return res.status(400).json({
        message:
          "Group can't be deleted while there are other admins in the group!",
      });
    }
  } else {
    return res.status(400).json({
      message: "User isn't admin in this group!",
    });
  }

  const deletedGroup = await prisma.chat.delete({
    where: {
      id: groupId,
      type: "GROUP",
    },
  });

  return res
    .status(200)
    .json({ message: "Group deleted successfully!", deletedGroup });
});

module.exports = {
  getPrivateChatsByUserId,
  getPrivateChatById,
  createPrivateChat,
  createPrivateChatMessage,
  getGroupChatsByUserId,
  getGroupCandidates,
  createGroupChat,
  getGroupChatById,
  createGroupChatMessage,
  updateGroupChatById,
  updateGroupChatAdmins,
  handleGroupChatMemberLeave,
  deleteGroupChatById,
};
