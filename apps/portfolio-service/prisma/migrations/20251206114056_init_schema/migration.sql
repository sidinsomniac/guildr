-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "riskProfile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Portfolio',
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "buyPrice" DECIMAL(12,4) NOT NULL,
    "assetClass" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_allocations" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "equityPct" DECIMAL(12,4) NOT NULL,
    "debtPct" DECIMAL(12,4) NOT NULL,
    "cashPct" DECIMAL(12,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "target_allocations_portfolioId_key" ON "target_allocations"("portfolioId");

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_allocations" ADD CONSTRAINT "target_allocations_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
