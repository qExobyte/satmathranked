/*
  Warnings:

  - A unique constraint covering the columns `[userId,problemId]` on the table `StarredProblem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StarredProblem_userId_problemId_key" ON "StarredProblem"("userId", "problemId");
