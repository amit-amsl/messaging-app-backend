const SOCKET_EVENTS = {
  onlineUsersStatus: {
    InitialLoginStatus: "initial-onlineUsers-data",
    StatusUpdate: "online-users-status",
  },
  privateChat: {
    Join: "private-chat:join",
    Create: "private-chat:create-chat",
    NewMessage: "private-chat:new-message",
  },
  groupChat: {
    Join: "group-chat:join",
    Create: "group-chat:create-chat",
    Update: "group-chat:update-chat",
    NewMessage: "group-chat:new-message",
    AdminSettingUpdate: "group-chat:admin-setting",
    MemberLeave: "group-chat:member-leave",
    Delete: "group-chat:delete-group",
  },
  Test: "msg-test",
};

module.exports = { SOCKET_EVENTS };
