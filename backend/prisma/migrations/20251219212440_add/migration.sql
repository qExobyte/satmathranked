/*
  Warnings:

  - A unique constraint covering the columns `[topicId,userId]` on the table `TopicElo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TopicElo_topicId_userId_key" ON "TopicElo"("topicId", "userId");
