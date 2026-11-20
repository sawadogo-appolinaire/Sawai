-- CreateEnum
CREATE TYPE "Who" AS ENUM ('YOU', 'Ai');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "toDayRequest" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentGenerator" (
    "id" TEXT NOT NULL,
    "who" "Who" NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentGenerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioGenerator" (
    "id" TEXT NOT NULL,
    "who" "Who" NOT NULL,
    "audioUrl" TEXT,
    "content" TEXT,
    "userId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudioGenerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageGenerator" (
    "id" TEXT NOT NULL,
    "who" "Who" NOT NULL,
    "imageUrl" TEXT,
    "content" TEXT,
    "userId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageGenerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestGestion" (
    "id" TEXT NOT NULL,
    "FirstRequestTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EndRequestTime" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RequestGestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContentGenerator_id_key" ON "ContentGenerator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AudioGenerator_id_key" ON "AudioGenerator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ImageGenerator_id_key" ON "ImageGenerator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RequestGestion_id_key" ON "RequestGestion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RequestGestion_userId_key" ON "RequestGestion"("userId");

-- AddForeignKey
ALTER TABLE "ContentGenerator" ADD CONSTRAINT "ContentGenerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioGenerator" ADD CONSTRAINT "AudioGenerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGenerator" ADD CONSTRAINT "ImageGenerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestGestion" ADD CONSTRAINT "RequestGestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
