const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");
const { socketAuthCheck } = require("./middleware/auth.middleware");

exports.isProduction = () => {
  return process.env.NODE_ENV === "production";
};

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  validate: { xForwardedForHeader: false },
});

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses form payloads and sets it to the `req.body`
app.use(cookieParser());

if (this.isProduction()) app.use(limiter);

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const chatsRoutes = require("./routes/chats.routes");

app.get("/api/health", (_req, res) => {
  res.json({ healthy: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);

const connectedSocketsUserIdMap = new Map();
const { SOCKET_EVENTS } = require("./utils/socket-events");

io.use(async (socket, next) => {
  if (!socket.handshake.headers.cookie) {
    return next(new Error("Token invalid!"));
  } else {
    const authToken = socket.handshake.headers.cookie.split("=");
    const authVerify = await socketAuthCheck(authToken[1]);
    if (authVerify) {
      socket.userId = authVerify.userId;
      next();
    } else {
      return next(new Error("Auth invalid!"));
    }
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.emit(SOCKET_EVENTS.onlineUsersStatus.InitialLoginStatus, {
    currentOnlineUsers: Array.from(connectedSocketsUserIdMap.keys()),
  });

  socket.on(SOCKET_EVENTS.onlineUsersStatus.StatusUpdate, (userId) => {
    connectedSocketsUserIdMap.set(userId, socket.id);
    io.emit(SOCKET_EVENTS.onlineUsersStatus.StatusUpdate, {
      newOnlineUser: userId,
    });
  });

  socket.on(SOCKET_EVENTS.privateChat.Join, (chatId) => {
    socket.join(chatId);
    //console.log("Rooms", socket.rooms);
  });

  socket.on(SOCKET_EVENTS.groupChat.Join, (groupId) => {
    socket.join(groupId);
  });

  socket.on(SOCKET_EVENTS.groupChat.Create, (data) => {
    const groupMembersIds = data;
    groupMembersIds.forEach((groupMemberId) => {
      socket
        .to(connectedSocketsUserIdMap.get(groupMemberId))
        .emit(SOCKET_EVENTS.groupChat.Create);
    });
  });

  socket.on(SOCKET_EVENTS.groupChat.Update, (data) => {
    socket.broadcast.emit(SOCKET_EVENTS.groupChat.Update, data);
  });

  socket.on(SOCKET_EVENTS.groupChat.NewMessage, (data) => {
    const { groupId } = data;
    const message = { groupId, ...data.newData };
    socket.to(groupId).emit(SOCKET_EVENTS.groupChat.NewMessage, message);
  });

  socket.on(SOCKET_EVENTS.groupChat.AdminSettingUpdate, (data) => {
    const { groupId } = data;
    socket
      .to(groupId)
      .emit(SOCKET_EVENTS.groupChat.AdminSettingUpdate, { groupId });
  });

  socket.on(SOCKET_EVENTS.groupChat.MemberLeave, (data) => {
    const { groupId } = data;
    socket.to(groupId).emit(SOCKET_EVENTS.groupChat.MemberLeave, { groupId });
  });

  socket.on(SOCKET_EVENTS.groupChat.Delete, (data) => {
    const { groupId } = data;
    socket.to(groupId).emit(SOCKET_EVENTS.groupChat.Delete, { groupId });
  });

  socket.on(SOCKET_EVENTS.privateChat.Create, (data) => {
    const userId = data;
    const sockIdTo = connectedSocketsUserIdMap.get(userId);
    if (!sockIdTo) return;
    socket
      .to(sockIdTo)
      .emit(SOCKET_EVENTS.privateChat.Create, `chat initiated`);
  });

  socket.on(SOCKET_EVENTS.privateChat.NewMessage, (data) => {
    const { chatId } = data;
    const message = { chatId, ...data.newData };
    socket.to(chatId).emit(SOCKET_EVENTS.privateChat.NewMessage, message);
  });

  socket.on(SOCKET_EVENTS.Test, (data) => {
    console.log(data);
    //socket.emit(SOCKET_EVENTS.Test, data);
    io.emit(SOCKET_EVENTS.Test, data);
  });

  socket.on("disconnect", () => {
    connectedSocketsUserIdMap.delete(socket.userId);
    console.log(`User ${socket.id} disconnected`);
    console.log(connectedSocketsUserIdMap);
    io.emit(SOCKET_EVENTS.onlineUsersStatus.StatusUpdate, {
      disconnectedUser: socket.userId,
    });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

httpServer.listen(PORT, () => console.log(`listening on port ${PORT}!`));
