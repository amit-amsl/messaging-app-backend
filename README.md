# LeafChat API (Backend)

<p align="center">
  <img src="public/leafchat_logo_resize.png" />
</p>
The backend API which powers the LeafChat messenger application.

## Built with

<a href="https://nodejs.org">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" height="40" alt="Node.js">
</a>
<a href="https://expressjs.com">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" height="40" alt="Express">
</a>
<a href="https://www.postgresql.org">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" height="40" alt="PostgreSQL">
</a>
<a href="https://www.prisma.io">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" height="40" alt="Prisma">
</a>
<a href="https://cloudinary.com/">
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white" height="40" alt="Cloudinary">
</a>
<a href="https://socket.io">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white" height="40" alt="Socket.IO"/>
</a>
<a href="https://jwt.io">
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" height="40" alt="JWT">
</a>
<a href="https://zod.dev">
  <img src="https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white" height="40" alt="Zod" />
</a>

## Deployment

Deployed on [Render](https://render.com/).

## API Endpoints

### Authentication

| Endpoint           | Method | Description               |
| ------------------ | ------ | ------------------------- |
| /api/auth/login    | POST   | User login                |
| /api/auth/register | POST   | User registration         |
| /api/auth/logout   | POST   | User logout               |
| /api/auth/me       | GET    | Check user authentication |

### Chats (Group/Private)

| Endpoint                               | Method | Description                                                     |
| -------------------------------------- | ------ | --------------------------------------------------------------- |
| /api/chats/private-chats               | GET    | Fetch user's private chats                                      |
| /api/chats/private-chats               | POST   | Create private chat with a user from contacts list              |
| /api/chats/private-chats/:chatId       | GET    | Fetch a private chat between users                              |
| /api/chats/private-chats/:chatId       | POST   | Create a message in private chat                                |
| /api/chats/group-chats                 | GET    | Fetch group chats that user participates in                     |
| /api/chats/group-chats                 | POST   | Create a new group chat                                         |
| /api/chats/group-chats/candidates      | GET    | Fetch potential users when picking users on group chat creation |
| /api/chats/group-chats/:groupId        | GET    | Fetch a group chat                                              |
| /api/chats/group-chats/:groupId        | POST   | Create a message in group chat                                  |
| /api/chats/group-chats/:groupId        | PATCH  | Update group chat's participants and/or name                    |
| /api/chats/group-chats/:groupId        | DELETE | Delete a group chat (Group Admin only)                          |
| /api/chats/group-chats/:groupId/admins | PATCH  | Update group chat's admins (Group Admin only)                   |
| /api/chats/group-chats/:groupId/leave  | DELETE | Leave group chat                                                |

### User Management

| Endpoint                   | Method | Description                                   |
| -------------------------- | ------ | --------------------------------------------- |
| /api/users/profile/:userId | GET    | Fetch user profile info                       |
| /api/users/contacts-list   | GET    | Fetch available users for private chatting    |
| /api/users/:userId         | PATCH  | Update profile image of an authenticated user |

## Socket Events

### User status

| Event                      | Description                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `initial-onlineUsers-data` | Emits the current list of online users to the connected client.  |
| `online-users-status`      | Broadcasts updates when users go online or offline in real time. |

### Private chats

| Event                      | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `private-chat:join`        | Joins a private chat room between two users by `chatId`. |
| `private-chat:create-chat` | Requests the creation of a new private chat.             |
| `private-chat:new-message` | Emits or receives a new message in a private chat room.  |

### Group chats

| Event                      | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `group-chat:join`          | Joins a group chat room by `groupId` to receive and send group messages. |
| `group-chat:create-chat`   | Triggers the creation of a new group chat with selected users.           |
| `group-chat:update-chat`   | Updates group chat's name and/or user participants.                      |
| `group-chat:new-message`   | Sends or receives a new message in a group chat.                         |
| `group-chat:admin-setting` | Updates admin-related settings (e.g., promote/demote users).             |
| `group-chat:member-leave`  | Notifies that a member has voluntarily left a group chat.                |
| `group-chat:delete-group`  | Triggers deletion of a group and notifies all connected clients.         |

## Getting started

### 1. Clone the Repository

#### HTTPS

```bash
$ git clone https://github.com/amit-amsl/messaging-app-backend.git
```

#### SSH

```bash
$ git clone git@github.com:amit-amsl/messaging-app-backend.git
```

### 2. Install dependencies

```bash
cd messaging-app-backend
npm install
```

### 3. Set up an account on [Cloudinary](https://www.cloudinary.com/)

Find the cloud name, API key and API secret associated with your account. They will be used as env variables in the next stage.

### 4. Set up environment variables

Create a .env file in the root directory of the project and add the following variables. Adjust the values according to your environment:

```shell
# Server
NODE_ENV=<production-or-development>

# Database
DATABASE_URL=<postgresql://<your-db-username>:<your-db-password>@db:5432/leafchat_app?schema=public>

# JWT Auth
JWT_SECRET=<your-jwt-secret-min-32-chars>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloudinary-credentials>
CLOUDINARY_API_KEY=<your-cloudinary-credentials>
CLOUDINARY_API_SECRET=<your-cloudinary-credentials>

# Frontend
FRONTEND_URL=<your-frontend-app-url>
```

### 5. Set up a local development database

Open a terminal and create a new database in psql.

```bash
psql
CREATE DATABASE <your_database_name>;
# Connect to database
\c <your_database_name>
```

Open another terminal, cd to the project's directory and migrate the database schema.

```bash
npx prisma generate
npx prisma migrate dev
```

In the psql terminal, check that the schema has been successfully migrated over to the development db.

```bash
npx prisma migrate dev
```

### 6. Start development server

```bash
npm start
```

The API will be available at http://localhost:3000 by default.
Have fun!

### 7. Clone LeafChat frontend repo (Optional)

You may want to clone and run [LeafChat Frontend](https://github.com/amit-amsl/messaging-app-frontend). This frontend application provides the user interface for accessing the API functionalities.

## Tech Stack

- **ExpressJS**: Fast, unopinionated, and minimalist web application framework for Node.js
- **Prisma**: Next-generation ORM (Object-Relational Mapper) designed for modern application development with Node.js and TypeScript.
- **Cloudinary**: Cloud based media management service.
- **Socket.IO**: Library that enables low-latency, bidirectional and event-based communication between a client and a server.
- **jsonwebtoken**: Popular library for working with JWTs in Node.js. It provides a set of methods for creating, signing, and verifying JWTs.
- **Multer**: A Node.js middleware designed to handle multipart/form-data, which is commonly used for file uploads in web applications.
- **Sharp**: High-speed Node.js module designed for image processing
- **Streamifier**: A library to convert a Buffer/String into a readable stream
- **bcryptJS**: JavaScript library that implements the bcrypt password hashing algorithm. Used to securely hash passwords before storing them in a database

## Contributing:

Feel free to fork the repository and submit pull requests. Any contributions, whether they’re bug fixes, new features, or performance improvements, are always welcome.
