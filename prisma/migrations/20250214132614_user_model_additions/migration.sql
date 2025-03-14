-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "profile_img_publicId" TEXT,
ADD COLUMN     "profile_img_url" TEXT;
