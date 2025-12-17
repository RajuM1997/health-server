/*
  Warnings:

  - Changed the type of `appointmentFee` on the `doctors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "appointmentFee",
ADD COLUMN     "appointmentFee" INTEGER NOT NULL;
