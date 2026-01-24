-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CONSULTATION', 'TATTOO_SESSION');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "artistId" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTimeSlot" TEXT NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "description" TEXT,
    "referenceImages" TEXT[],
    "bodyPlacement" TEXT,
    "sizeEstimate" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "internalNotes" TEXT,
    "isMultiSession" BOOLEAN NOT NULL DEFAULT false,
    "sessionNumber" INTEGER NOT NULL DEFAULT 1,
    "parentBookingId" TEXT,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artistId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 120,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artistId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingRequest_artistId_preferredDate_idx" ON "BookingRequest"("artistId", "preferredDate");

-- CreateIndex
CREATE INDEX "BookingRequest_status_createdAt_idx" ON "BookingRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BookingRequest_clientEmail_idx" ON "BookingRequest"("clientEmail");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_artistId_dayOfWeek_idx" ON "AvailabilitySlot"("artistId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_artistId_dayOfWeek_startTime_key" ON "AvailabilitySlot"("artistId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "AvailabilityException_artistId_date_idx" ON "AvailabilityException"("artistId", "date");
