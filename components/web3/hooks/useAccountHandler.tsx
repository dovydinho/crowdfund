import { useEffect } from 'react';
import useSWR from 'swr';

import { sanityClient } from '@base/sanity';

export const handler = (provider: any) => () => {
  const { mutate, ...rest } = useSWR(
    () => (provider ? 'web3/accounts' : null),
    async () => {
      const accounts = await provider.listAccounts();
      try {
        const userDoc = {
          _type: 'users',
          _id: accounts[0],
          name: 'Unnamed',
          address: accounts[0]
        };
        await sanityClient.createIfNotExists(userDoc);
      } catch (error) {
        console.error('There was an error while creating a user.');
      }

      return accounts[0];
    }
  );

  useEffect(() => {
    provider &&
      provider.on('accountsChanged', (accounts: Array<string>) =>
        mutate(accounts[0] ?? null)
      );
  }, [provider]);

  return {
    mutate,
    ...rest
  };
};
