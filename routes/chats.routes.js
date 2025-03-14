const { Router } = require("express");
const chatsRouter = Router();
const {
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
} = require("../controllers/chats.controller");
const { userAuthenticationCheck } = require("../middleware/auth.middleware");

chatsRouter.use(userAuthenticationCheck);

/* PRIVATE CHATS ROUTES  */

chatsRouter.get("/private-chats", getPrivateChatsByUserId);

chatsRouter.post("/private-chats", createPrivateChat);

chatsRouter.get("/private-chats/:chatId", getPrivateChatById);

chatsRouter.post("/private-chats/:chatId", createPrivateChatMessage);

/* GROUPS ROUTES  */

chatsRouter.get("/group-chats", getGroupChatsByUserId);

chatsRouter.get("/group-chats/candidates", getGroupCandidates);

chatsRouter.post("/group-chats", createGroupChat);

chatsRouter.get("/group-chats/:groupId", getGroupChatById);

chatsRouter.post("/group-chats/:groupId", createGroupChatMessage);

chatsRouter.patch("/group-chats/:groupId", updateGroupChatById);

chatsRouter.delete("/group-chats/:groupId", deleteGroupChatById);

chatsRouter.patch("/group-chats/:groupId/admins", updateGroupChatAdmins);

chatsRouter.delete("/group-chats/:groupId/leave", handleGroupChatMemberLeave);

module.exports = chatsRouter;
