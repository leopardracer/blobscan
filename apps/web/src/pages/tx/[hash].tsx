import { useMemo } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

import { RollupBadge } from "~/components/Badges/RollupBadge";
import { Card } from "~/components/Cards/Card";
import { BlobCard } from "~/components/Cards/SurfaceCards/BlobCard";
import { Copyable, CopyToClipboard } from "~/components/CopyToClipboard";
import { StandardEtherUnitDisplay } from "~/components/Displays/StandardEtherUnitDisplay";
import { DetailsLayout } from "~/components/Layouts/DetailsLayout";
import type { DetailsLayoutProps } from "~/components/Layouts/DetailsLayout";
import { Link } from "~/components/Link";
import { NavArrows } from "~/components/NavArrows";
import { BlockStatus } from "~/components/Status";
import { api } from "~/api-client";
import NextError from "~/pages/_error";
import type { TransactionWithExpandedBlockAndBlob } from "~/types";
import {
  buildAddressRoute,
  buildBlockRoute,
  buildTransactionExternalUrl,
  formatTimestamp,
  formatBytes,
  formatNumber,
  performDiv,
  deserializeFullTransaction,
} from "~/utils";

const Tx: NextPage = () => {
  const router = useRouter();
  const hash = (router.query.hash as string | undefined) ?? "";

  const {
    data: rawTxData,
    error,
    isLoading,
  } = api.tx.getByHash.useQuery<TransactionWithExpandedBlockAndBlob>(
    { hash, expand: "block,blob" },
    { enabled: router.isReady }
  );
  const tx = useMemo(() => {
    if (!rawTxData) {
      return;
    }

    return deserializeFullTransaction(rawTxData);
  }, [rawTxData]);

  const { data: neighbors } = api.tx.getTxNeighbors.useQuery(
    tx
      ? {
          senderAddress: tx.from,
          blockNumber: tx.blockNumber,
          index: tx.index,
        }
      : {
          senderAddress: "",
          blockNumber: 0,
          index: 0,
        },
    {
      enabled: Boolean(tx),
    }
  );

  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  if (!isLoading && !tx) {
    return <div>Transaction not found</div>;
  }

  let detailsFields: DetailsLayoutProps["fields"] | undefined;

  if (tx) {
    detailsFields = [];

    const {
      blobAsCalldataGasUsed,
      blobs,
      block,
      hash,
      blockNumber,
      blockTimestamp,
      from,
      to,
      rollup,
      blobGasUsed,
      blobGasBaseFee,
      blobGasMaxFee,
      blobAsCalldataGasFee,
    } = tx;

    detailsFields = [
      {
        name: "Hash",
        value: <Copyable value={hash} label="Copy Hash" />,
      },
      { name: "Status", value: <BlockStatus blockNumber={blockNumber} /> },
      {
        name: "Block",
        value: <Link href={buildBlockRoute(blockNumber)}>{blockNumber}</Link>,
      },
      {
        name: "Timestamp",
        value: (
          <div className="whitespace-break-spaces">
            {formatTimestamp(blockTimestamp)}
          </div>
        ),
      },
      {
        name: "Position In Block",
        value: tx.index,
      },
      {
        name: "From",
        value: (
          <div className="flex items-center gap-2">
            <Link href={buildAddressRoute(from)}>{from}</Link>
            <CopyToClipboard value={from} label="Copy from address" />
          </div>
        ),
      },
      {
        name: "To",
        value: (
          <div className="flex items-center gap-2">
            <Link href={buildAddressRoute(to)}>{to}</Link>
            <CopyToClipboard value={to} label="Copy to address" />
          </div>
        ),
      },
    ];

    if (rollup) {
      detailsFields.push({
        name: "Rollup",
        value: <RollupBadge rollup={rollup} />,
      });
    }

    const totalBlobSize = blobs.reduce((acc, b) => acc + b.size, 0);

    detailsFields.push(
      {
        name: "Total Blob Size",
        value: formatBytes(totalBlobSize),
      },
      {
        name: "Blob Gas Price",
        value: <StandardEtherUnitDisplay amount={block.blobGasPrice} />,
      },
      {
        name: "Blob Fee",
        value: (
          <div className="flex flex-col gap-4">
            {blobGasBaseFee ? (
              <div className="flex gap-1">
                <div className="mr-1 text-contentSecondary-light dark:text-contentSecondary-dark">
                  Base:
                </div>
                <StandardEtherUnitDisplay amount={blobGasBaseFee} />
              </div>
            ) : null}
            <div className=" flex gap-1">
              <div className="mr-1 text-contentSecondary-light dark:text-contentSecondary-dark">
                Max:
              </div>
              <StandardEtherUnitDisplay amount={blobGasMaxFee} />
            </div>
          </div>
        ),
      },
      {
        name: "Blob Gas Used",
        value: formatNumber(blobGasUsed),
      },
      {
        name: "Blob As Calldata Gas Used",
        value: (
          <div>
            {formatNumber(blobAsCalldataGasUsed)}{" "}
            <span className="text-contentTertiary-light dark:text-contentTertiary-dark">
              |{" "}
              <strong>
                {formatNumber(
                  performDiv(blobAsCalldataGasUsed, blobGasUsed),
                  "compact",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>{" "}
              times larger
            </span>
          </div>
        ),
      },
      {
        name: "Blob As Calldata Gas Fee",
        value: (
          <div className="display flex gap-1">
            {<StandardEtherUnitDisplay amount={blobAsCalldataGasFee} />}
            <span className="text-contentTertiary-light dark:text-contentTertiary-dark">
              |{" "}
              <strong>
                {formatNumber(
                  performDiv(blobAsCalldataGasFee, blobGasBaseFee),
                  "compact",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>{" "}
              times more expensive
            </span>
          </div>
        ),
      }
    );
  }

  return (
    <>
      <DetailsLayout
        header={
          <div className="flex items-center justify-start gap-4">
            Transaction Details
            <NavArrows
              prev={{
                href: neighbors?.prev ? `/tx/${neighbors.prev}` : undefined,
                tooltip: "Previous transaction from this sender",
              }}
              next={{
                href: neighbors?.next ? `/tx/${neighbors.next}` : undefined,
                tooltip: "Next transaction from this sender",
              }}
            />
          </div>
        }
        externalLink={tx ? buildTransactionExternalUrl(tx.hash) : undefined}
        fields={detailsFields}
      />

      <Card header={`Blobs ${tx ? `(${tx.blobs.length})` : ""}`}>
        <div className="space-y-6">
          {isLoading || !tx || !tx.blobs
            ? Array.from({ length: 2 }).map((_, i) => <BlobCard key={i} />)
            : tx.blobs.map((b) => <BlobCard key={b.versionedHash} blob={b} />)}
        </div>
      </Card>
    </>
  );
};

export default Tx;
