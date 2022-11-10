import { useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';

const NETWORKS: Object = {
  1: 'Ethereum Main Network',
  3: 'Ropsten Test Network',
  4: 'Rinkeby Test Network',
  5: 'Goerli Test Network',
  42: 'Kovan Test Network',
  56: 'Binance Smart Chain',
  5777: 'Ganache',
  31337: 'Localhost'
};

const targetNetwork =
  NETWORKS[process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as keyof Object];

export const handler = (provider: any) => () => {
  const { mutate } = useSWRConfig();
  const { data, ...rest } = useSWR(
    () => (provider ? 'web3/network' : null),
    async () => {
      const network = await provider?.getNetwork();
      const chainId = network?.chainId;
      return NETWORKS[chainId as keyof Object];
    }
  );

  useEffect(() => {
    provider &&
      provider.on('chainChanged', (chainId: string) => {
        NETWORKS[parseInt(chainId, 16) as unknown as keyof Object];
      });
  }, [mutate]);

  return {
    data,
    mutate,
    target: targetNetwork,
    isSupported: data === targetNetwork,
    ...rest
  };
};
