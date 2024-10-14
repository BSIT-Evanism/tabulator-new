-- CreateEnum
CREATE TYPE "SwimwearSubCategory" AS ENUM ('BEAUTY_OF_FIGURE', 'STAGE_PRESENCE', 'POISE_AND_BEARING');

-- CreateEnum
CREATE TYPE "FormalAttireSubCategory" AS ENUM ('ATTIRE_AND_CARRIAGE', 'STAGE_PRESENCE', 'POISE_AND_BEARING');

-- CreateEnum
CREATE TYPE "QuestionAndAnswerSubCategory" AS ENUM ('INTELLIGENCE', 'POISE_AND_BEARING');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "Judge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generatedPassword" TEXT NOT NULL,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Judge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contestant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "age" INTEGER NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "Contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageantState" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "PageantState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwimwearScores" (
    "id" SERIAL NOT NULL,
    "judgeId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "subCategory" "SwimwearSubCategory" NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "SwimwearScores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormalAttireScores" (
    "id" SERIAL NOT NULL,
    "judgeId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "subCategory" "FormalAttireSubCategory" NOT NULL,

    CONSTRAINT "FormalAttireScores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAndAnswer" (
    "id" SERIAL NOT NULL,
    "judgeId" TEXT NOT NULL,
    "contestantId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "subCategory" "QuestionAndAnswerSubCategory" NOT NULL,

    CONSTRAINT "QuestionAndAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SwimwearScores" ADD CONSTRAINT "SwimwearScores_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwimwearScores" ADD CONSTRAINT "SwimwearScores_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormalAttireScores" ADD CONSTRAINT "FormalAttireScores_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormalAttireScores" ADD CONSTRAINT "FormalAttireScores_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAndAnswer" ADD CONSTRAINT "QuestionAndAnswer_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAndAnswer" ADD CONSTRAINT "QuestionAndAnswer_contestantId_fkey" FOREIGN KEY ("contestantId") REFERENCES "Contestant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
