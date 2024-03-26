import { max, sum } from 'd3-array';
import { useTranslation } from 'react-i18next';
import { Mode, TimeAverages } from 'utils/constants';
import { formatCo2 } from 'utils/formatting';

import { ChartTitle } from './ChartTitle';
import AreaGraph from './elements/AreaGraph';
import { getBadgeText, noop } from './graphUtils';
import useBreakdownChartData from './hooks/useBreakdownChartData';
import { NotEnoughDataMessage } from './NotEnoughDataMessage';
import BreakdownChartTooltip from './tooltips/BreakdownChartTooltip';

interface BreakdownChartProps {
  displayByEmissions: boolean;
  datetimes: Date[];
  timeAverage: TimeAverages;
}

function BreakdownChart({
  displayByEmissions,
  datetimes,
  timeAverage,
}: BreakdownChartProps) {
  const { data, mixMode } = useBreakdownChartData();
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  const isBreakdownGraphOverlayEnabled =
    mixMode === Mode.CONSUMPTION && timeAverage !== TimeAverages.HOURLY;

  const { chartData, valueAxisLabel, layerFill, layerKeys } = data;

  // Find highest daily emissions to show correct unit on chart
  const maxEmissions = max(chartData.map((day) => sum(Object.values(day.layerData))));

  const formatAxisTick = (t: number) => formatCo2(t, maxEmissions);

  const titleDisplayMode = displayByEmissions ? 'emissions' : 'electricity';
  const titleMixMode = mixMode === Mode.CONSUMPTION ? 'origin' : 'production';

  const hasEnoughDataToDisplay = datetimes?.length > 2;

  const badgeText = getBadgeText(chartData, t);

  if (!hasEnoughDataToDisplay) {
    return (
      <NotEnoughDataMessage
        title={`country-history.${titleDisplayMode}${titleMixMode}`}
      />
    );
  }

  return (
    <>
      <ChartTitle
        translationKey={`country-history.${titleDisplayMode}${titleMixMode}`}
        badgeText={badgeText}
      />
      <div className="relative">
        {isBreakdownGraphOverlayEnabled && (
          <div className="absolute top-0 h-full w-full">
            <div className=" h-full w-full bg-white opacity-50 dark:bg-gray-800" />
            <div className="absolute left-[50%] top-[50%] z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-gray-200 p-2 text-center text-sm shadow-lg dark:bg-gray-900">
              Temporarily disabled for consumption. <br /> Switch to production view
            </div>
          </div>
        )}

        <AreaGraph
          testId="history-mix-graph"
          data={chartData}
          layerKeys={layerKeys}
          layerFill={layerFill}
          valueAxisLabel={valueAxisLabel}
          markerUpdateHandler={noop}
          markerHideHandler={noop}
          isMobile={false} // Todo: test on mobile https://linear.app/electricitymaps/issue/ELE-1498/test-and-improve-charts-on-mobile
          height="10em"
          isOverlayEnabled={isBreakdownGraphOverlayEnabled}
          datetimes={datetimes}
          selectedTimeAggregate={timeAverage}
          tooltip={BreakdownChartTooltip}
          tooltipSize={displayByEmissions ? 'small' : 'large'}
          {...(displayByEmissions && { formatTick: formatAxisTick })}
        />
      </div>
      {isBreakdownGraphOverlayEnabled && (
        <div
          className="prose my-1 rounded bg-gray-200 p-2 text-sm leading-snug dark:bg-gray-800 dark:text-white dark:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: t('country-panel.exchangesAreMissing') }}
        />
      )}
    </>
  );
}

export default BreakdownChart;
