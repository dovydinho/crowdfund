import { handler as createAccountHook } from './useAccountHandler';
import { handler as createNetworkHook } from './useNetworkHandler';

export const setupHooks = ({ provider }: { provider: any; contract: any }) => {
  return {
    useAccount: createAccountHook(provider),
    useNetwork: createNetworkHook(provider)
  };
};
