import * as Switch from '@radix-ui/react-switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from 'api/helpers';
import { useSearchParams } from 'react-router-dom';

import { useFeatureFlags } from './api';
import { FeatureFlags } from './types';

function Content({ features }: { features: FeatureFlags }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    // Leaving an empty function here as we only want to apply mutation locally
    mutationFn: (_key: string) => Promise.resolve(),
    onMutate: async (key) => {
      // Snapshot the previous value
      const previousState = queryClient.getQueryData([QUERY_KEYS.FEATURE_FLAGS]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        [QUERY_KEYS.FEATURE_FLAGS],
        (old: FeatureFlags | undefined) => {
          return {
            ...old,
            [key]: !old?.[key],
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousState };
    },
  });

  return (
    <div>
      <p className="pb-1 font-poppins text-sm text-gray-600">Feature Flags</p>
      {Object.entries(features).map(([key, value]) => (
        <div className="flex w-full items-center justify-between text-sm" key={key}>
          <label className="pr-8" htmlFor={key}>
            {key}
          </label>
          <Switch.Root
            className="relative h-[20px] w-[38px] cursor-default rounded-full bg-gray-300 outline-none data-[state=checked]:bg-brand-green"
            id={key}
            defaultChecked={Boolean(value)}
            onCheckedChange={() => mutation.mutate(key)}
          >
            <Switch.Thumb className="block h-[16px] w-[16px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
          </Switch.Root>
        </div>
      ))}
    </div>
  );
}

export default function FeatureFlagsManager() {
  const features = useFeatureFlags();

  const [searchParameters] = useSearchParams();
  const showManager =
    searchParameters.get('ff') === 'true' || searchParameters.get('ff') === '';

  if (!features || !showManager) {
    return null;
  }

  return (
    <div className="invisible fixed bottom-28 right-4 z-40 flex w-[224px] flex-col rounded bg-white/90 px-4 py-4  shadow-lg backdrop-blur-sm sm:visible dark:bg-gray-800">
      <Content features={features} />
    </div>
  );
}
