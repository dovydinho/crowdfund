import { handler as createAccountHook } from './useAccountHandler';
import { handler as createNetworkHook } from './useNetworkHandler';
import { handler as createProjectsHook } from './useProjectsHandler';

export const setupHooks = ({
  provider,
  contract
}: {
  provider: any;
  contract: any;
}) => {
  return {
    useAccount: createAccountHook(provider),
    useNetwork: createNetworkHook(provider)
    // useProjects: createProjectsHook(provider, contract)
  };
};
