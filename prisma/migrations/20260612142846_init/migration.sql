-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialBatch" (
    "id" SERIAL NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "unitPurchasePrice" INTEGER NOT NULL,
    "initialQuantity" DECIMAL(12,3) NOT NULL,
    "remainingQuantity" DECIMAL(12,3) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssemblyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyTemplateItem" (
    "id" SERIAL NOT NULL,
    "assemblyTemplateId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "quantityPerUnit" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssemblyTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assembly" (
    "id" SERIAL NOT NULL,
    "assemblyTemplateId" INTEGER NOT NULL,
    "quantityAssembled" INTEGER NOT NULL DEFAULT 1,
    "remainingQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assembly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssemblyItem" (
    "id" SERIAL NOT NULL,
    "assemblyId" INTEGER NOT NULL,
    "rawMaterialBatchId" INTEGER NOT NULL,
    "rawMaterialId" INTEGER NOT NULL,
    "quantityPerUnit" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssemblyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT,
    "clientId" INTEGER,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "assemblyId" INTEGER NOT NULL,
    "quantitySold" INTEGER NOT NULL,
    "sellingPricePerUnit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawMaterial_deletedAt_idx" ON "RawMaterial"("deletedAt");

-- CreateIndex
CREATE INDEX "RawMaterialBatch_rawMaterialId_idx" ON "RawMaterialBatch"("rawMaterialId");

-- CreateIndex
CREATE INDEX "RawMaterialBatch_remainingQuantity_idx" ON "RawMaterialBatch"("remainingQuantity");

-- CreateIndex
CREATE INDEX "AssemblyTemplate_deletedAt_idx" ON "AssemblyTemplate"("deletedAt");

-- CreateIndex
CREATE INDEX "AssemblyTemplateItem_assemblyTemplateId_idx" ON "AssemblyTemplateItem"("assemblyTemplateId");

-- CreateIndex
CREATE INDEX "AssemblyTemplateItem_rawMaterialId_idx" ON "AssemblyTemplateItem"("rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyTemplateItem_assemblyTemplateId_rawMaterialId_key" ON "AssemblyTemplateItem"("assemblyTemplateId", "rawMaterialId");

-- CreateIndex
CREATE INDEX "Assembly_assemblyTemplateId_idx" ON "Assembly"("assemblyTemplateId");

-- CreateIndex
CREATE INDEX "Assembly_remainingQuantity_idx" ON "Assembly"("remainingQuantity");

-- CreateIndex
CREATE INDEX "AssemblyItem_assemblyId_idx" ON "AssemblyItem"("assemblyId");

-- CreateIndex
CREATE INDEX "AssemblyItem_rawMaterialBatchId_idx" ON "AssemblyItem"("rawMaterialBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyItem_assemblyId_rawMaterialId_key" ON "AssemblyItem"("assemblyId", "rawMaterialId");

-- CreateIndex
CREATE INDEX "Client_deletedAt_idx" ON "Client"("deletedAt");

-- CreateIndex
CREATE INDEX "Sale_clientId_idx" ON "Sale"("clientId");

-- CreateIndex
CREATE INDEX "Sale_soldAt_idx" ON "Sale"("soldAt");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_assemblyId_idx" ON "SaleItem"("assemblyId");

-- AddForeignKey
ALTER TABLE "RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyTemplateItem" ADD CONSTRAINT "AssemblyTemplateItem_assemblyTemplateId_fkey" FOREIGN KEY ("assemblyTemplateId") REFERENCES "AssemblyTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyTemplateItem" ADD CONSTRAINT "AssemblyTemplateItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_assemblyTemplateId_fkey" FOREIGN KEY ("assemblyTemplateId") REFERENCES "AssemblyTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyItem" ADD CONSTRAINT "AssemblyItem_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyItem" ADD CONSTRAINT "AssemblyItem_rawMaterialBatchId_fkey" FOREIGN KEY ("rawMaterialBatchId") REFERENCES "RawMaterialBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssemblyItem" ADD CONSTRAINT "AssemblyItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
