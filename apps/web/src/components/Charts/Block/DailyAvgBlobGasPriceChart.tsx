import type { FC } from "react";
import type { EChartOption } from "echarts";

import { formatWei, prettyFormatWei } from "@blobscan/eth-format";

import { ChartCard } from "~/components/Cards/ChartCard";
import { useScaledWeiAmounts } from "~/hooks/useScaledWeiAmounts";
import type { DailyBlockStats } from "~/types";
import { buildTimeSeriesOptions } from "~/utils";

export type DailyAvgBlobGasPriceChartProps = {
  days: DailyBlockStats["days"];
  avgBlobGasPrices: DailyBlockStats["avgBlobGasPrices"];
  opts?: EChartOption;
};

export const DailyAvgBlobGasPriceChart: FC<
  Partial<DailyAvgBlobGasPriceChartProps>
> = function ({ days, avgBlobGasPrices, opts = {} }) {
  const { unit } = useScaledWeiAmounts(avgBlobGasPrices);

  const options: EChartOption<EChartOption.Series> = {
    ...buildTimeSeriesOptions({
      dates: days,
      axisFormatters: {
        yAxisTooltip: (value) => formatWei(value, { toUnit: unit }),
        yAxisLabel: (value) =>
          prettyFormatWei(value, { toUnit: unit, hideUnit: true }),
      },
    }),
    series: [
      {
        name: "Avg. Blob Gas Prices",
        data: avgBlobGasPrices,
        type: "line",
      },
    ],
    animationEasing: "cubicOut",
    ...opts,
  };

  return (
    <ChartCard
      title={`Daily Avg. Blob Gas Price (in ${unit})`}
      size="sm"
      options={options}
    />
  );
};
