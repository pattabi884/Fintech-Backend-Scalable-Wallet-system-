-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_no" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VAM" (
    "id" SERIAL NOT NULL,
    "merchant_id" INTEGER NOT NULL,
    "vam_id" TEXT NOT NULL,
    "pwd" VARCHAR(12) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VAM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllTransactions" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" TEXT NOT NULL,
    "irn" TEXT NOT NULL,
    "shardId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllLedger" (
    "id" SERIAL NOT NULL,
    "irn" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VAM_vam_id_key" ON "VAM"("vam_id");

-- CreateIndex
CREATE UNIQUE INDEX "AllTransactions_irn_key" ON "AllTransactions"("irn");

-- CreateIndex
CREATE UNIQUE INDEX "AllLedger_irn_key" ON "AllLedger"("irn");

-- AddForeignKey
ALTER TABLE "VAM" ADD CONSTRAINT "VAM_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
