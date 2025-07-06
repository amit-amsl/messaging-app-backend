const { uploadImageToCloudinary, cloudinary } = require("../utils/cloudinary");
const asyncHandler = require("express-async-handler");
const prisma = require("../utils/db");
const sharp = require("sharp");

const getAvailableUsersForPrivateChattingByUserId = asyncHandler(
  async (req, res) => {
    // This query finds all users except the current user (id: { not: currentUserId }) and those who already
    // have a private chat with the current user.
    // It checks if there is any UsersChats relationship (some) where the chat is of type PRIVATE (not GROUP) and
    // includes the current user (userId: currentUserId) as a participant.
    // If such a chat exists, the user is excluded from the results.
    const availableUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user.userId },
        NOT: {
          UsersChats: {
            some: {
              chat: {
                AND: [
                  { type: "PRIVATE" }, // Filter only private chats
                  {
                    UsersChats: {
                      some: {
                        userId: req.user.userId, // Ensure the current user is in the private chat
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
    return res.status(200).json(availableUsers);
  }
);

const getUserProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userProfile = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
    select: {
      id: true,
      username: true,
      bio: true,
      profile_img_publicId: true,
      profile_img_url: true,
      _count: {
        select: {
          messages: true,
          UsersChats: { where: { chat: { type: "GROUP" } } },
        },
      },
      createdAt: true,
    },
  });

  if (!userProfile) {
    return res
      .status(404)
      .json({ message: "User profile doesn't exist!", userId });
  }

  const totalMessagesReceived = await prisma.chat
    .findMany({
      where: { UsersChats: { some: { userId: +userId } } },
      select: {
        group_name: true,
        _count: {
          select: {
            Message: {
              where: { senderId: { not: +userId } },
            },
          },
        },
      },
    })
    .then((queryResult) =>
      queryResult.reduce((acc, current) => current._count.Message + acc, 0)
    );

  return res.status(200).json({
    id: userProfile.id,
    username: userProfile.username,
    bio: userProfile.bio,
    profile_img_url: userProfile.profile_img_url,
    createdAt: userProfile.createdAt,
    stats: {
      sentMessages: userProfile._count.messages,
      receivedMessages: totalMessagesReceived,
      groupsMemberOf: userProfile._count.UsersChats,
    },
  });
});

const updateUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { bio } = req.body;
  console.log(req.file);

  const userExists = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });

  if (!userExists) {
    return res.status(404).json({ message: "User doesn't exist!", userId });
  }

  if (req.file) {
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(640, 480)
      .toBuffer();
    const uploadedImage = await uploadImageToCloudinary(resizedImageBuffer, {
      folder: "messaging_app",
    });
    console.log(uploadedImage);
    const userProfileImageUpdated = await prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        profile_img_publicId: uploadedImage.public_id,
        profile_img_url: uploadedImage.secure_url,
      },
      select: {
        id: true,
        username: true,
      },
    });
    if (userExists.profile_img_publicId.length > 0) {
      await cloudinary.uploader.destroy(userExists.profile_img_publicId);
    }
  }

  if (userExists.bio !== bio) {
    const userUpdated = await prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        bio,
      },
      select: {
        id: true,
        username: true,
      },
    });
  }

  return res.status(200).json({ message: "User updated successfully" });
});

module.exports = {
  getAvailableUsersForPrivateChattingByUserId,
  getUserProfileById,
  updateUserById,
};
