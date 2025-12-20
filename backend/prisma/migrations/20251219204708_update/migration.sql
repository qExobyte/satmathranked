/*
  Warnings:

  - Changed the type of `problemDifficulty` on the `ProblemHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProblemHistory" DROP COLUMN "problemDifficulty",
ADD COLUMN     "problemDifficulty" INTEGER NOT NULL;
