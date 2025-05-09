-- CreateTable
CREATE TABLE "overall_stats" (
    "id" SERIAL NOT NULL,
    "category" "category",
    "rollup" "rollup",
    "avg_blob_as_calldata_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_blob_as_calldata_max_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_blob_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_blob_gas_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_blob_max_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_max_blob_gas_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_blob_as_calldata_fee" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_as_calldata_gas_used" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_as_calldata_max_fees" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_gas_price" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_fee" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_gas_used" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_max_fees" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blob_max_gas_fees" DECIMAL(100,0) NOT NULL DEFAULT 0,
    "total_blobs" INTEGER NOT NULL DEFAULT 0,
    "total_blob_size" BIGINT NOT NULL DEFAULT 0,
    "total_blocks" INTEGER NOT NULL DEFAULT 0,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "total_unique_blobs" INTEGER NOT NULL DEFAULT 0,
    "total_unique_receivers" INTEGER NOT NULL DEFAULT 0,
    "total_unique_senders" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overall_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "overall_stats_category_rollup_key" ON "overall_stats"("category", "rollup") NULLS NOT DISTINCT;
