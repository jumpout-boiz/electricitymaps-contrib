import { useTranslation } from 'react-i18next';
import { TimeAverages } from 'utils/constants';
import { formatCo2 } from 'utils/formatting';

import { ChartTitle } from './ChartTitle';
import AreaGraph from './elements/AreaGraph';
import { getBadgeText, noop } from './graphUtils';
import { useEmissionChartData } from './hooks/useEmissionChartData';
import EmissionChartTooltip from './tooltips/EmissionChartTooltip';

interface EmissionChartProps {
  datetimes: Date[];
  timeAverage: TimeAverages;
}

function EmissionChart({ timeAverage, datetimes }: EmissionChartProps) {
  const { data, isLoading, isError } = useEmissionChartData();
  const { t } = useTranslation();
  if (isLoading || isError || !data) {
    return null;
  }

  const { chartData, layerFill, layerKeys } = data;

  const maxEmissions = Math.max(...chartData.map((o) => o.layerData.emissions));
  const formatAxisTick = (t: number) => formatCo2(t, maxEmissions);

  const badgeText = getBadgeText(chartData, t);

  return (
    <>
      <ChartTitle translationKey="country-history.emissions" badgeText={badgeText} />
      <AreaGraph
        testId="history-emissions-graph"
        data={chartData}
        layerKeys={layerKeys}
        layerFill={layerFill}
        valueAxisLabel="CO₂eq"
        markerUpdateHandler={noop}
        markerHideHandler={noop}
        datetimes={datetimes}
        isMobile={false}
        selectedTimeAggregate={timeAverage}
        height="8em"
        tooltip={EmissionChartTooltip}
        formatTick={formatAxisTick}
      />
    </>
  );
}

export default EmissionChart;
