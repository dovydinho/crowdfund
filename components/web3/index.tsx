import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import { setupHooks } from '@components/web3/hooks/setupHooks';
import { loadContract } from '@utils/index';
import { ExternalProvider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

const Web3Context = createContext(null as any);

const createWeb3State = ({
  provider,
  contract,
  signer,
  isLoading
}: {
  provider: any;
  contract: any;
  signer: any;
  isLoading: boolean;
}) => {
  return {
    provider,
    contract,
    signer,
    isLoading,
    hooks: setupHooks({ provider, contract })
  };
};

export default function Web3Provider({ children }: any) {
  const [web3Api, setWeb3Api] = useState(
    createWeb3State({
      provider: null,
      contract: null,
      signer: null,
      isLoading: true
    })
  );

  useEffect(() => {
    const loadProvider = async () => {
      const provider =
        window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
      if (provider) {
        const signer = provider.getSigner();
        const contract = await loadContract(
          '0xb465C6E71C8694846426A28f596D4c44D203F6bC',
          'ProjectCrowdfundFactory',
          signer
        );
        setWeb3Api(
          createWeb3State({
            provider,
            contract,
            signer,
            isLoading: false
          })
        );
      } else {
        setWeb3Api((api) => ({ ...api, isLoading: false }));
      }
    };
    loadProvider();
  }, []);

  const _web3Api = useMemo(() => {
    const { provider, isLoading } = web3Api;
    return {
      ...web3Api,
      requireInstall: !isLoading && !provider,
      connect: provider
        ? async () => {
            try {
              await provider.send('eth_requestAccounts', []);
            } catch {
              location.reload();
            }
          }
        : () =>
            console.error(
              'Cannot connect to Metamask, try to reload your browser please.'
            )
    };
  }, [web3Api]);

  return (
    <Web3Context.Provider value={_web3Api}>{children}</Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
