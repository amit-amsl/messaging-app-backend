/*
  Warnings:

  - You are about to drop the column `groupChatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `privateChatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `GroupChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupChatParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateChatParticipant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('PRIVATE', 'GROUP');

-- DropForeignKey
ALTER TABLE "GroupChatParticipant" DROP CONSTRAINT "GroupChatParticipant_groupChatId_fkey";

-- DropForeignKey
ALTER TABLE "GroupChatParticipant" DROP CONSTRAINT "GroupChatParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupChatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_privateChatId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateChatParticipant" DROP CONSTRAINT "PrivateChatParticipant_privateChatId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateChatParticipant" DROP CONSTRAINT "PrivateChatParticipant_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "groupChatId",
DROP COLUMN "privateChatId",
ADD COLUMN     "chatId" TEXT NOT NULL;

-- DropTable
DROP TABLE "GroupChat";

-- DropTable
DROP TABLE "GroupChatParticipant";

-- DropTable
DROP TABLE "PrivateChat";

-- DropTable
DROP TABLE "PrivateChatParticipant";

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "type" "ChatType" NOT NULL DEFAULT 'PRIVATE',
    "group_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnChats" (
    "userId" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsersOnChats_pkey" PRIMARY KEY ("userId","chatId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnChats_userId_chatId_key" ON "UsersOnChats"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "UsersOnChats" ADD CONSTRAINT "UsersOnChats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnChats" ADD CONSTRAINT "UsersOnChats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
