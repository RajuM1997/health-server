/*
  Warnings:

  - You are about to drop the column `videoCallId` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `videoCallingId` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "videoCallId",
ADD COLUMN     "videoCallingId" TEXT NOT NULL;
