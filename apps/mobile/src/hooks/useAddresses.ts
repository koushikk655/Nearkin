// Address hooks — list + create. Edit/delete land with the Settings
// screen in Week 6; checkout only needs list + quick-add.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addressesApi, type AddressInput } from '../api/addresses';
import { queryKeys } from '../lib/queryKeys';
import { useAuthStore } from '../store/authStore';

export function useAddresses() {
  const authed = !!useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.addresses(),
    queryFn: addressesApi.list,
    enabled: authed,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => addressesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.addresses() });
    },
  });
}
