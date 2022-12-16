const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;
import { ethers } from 'ethers';

export const loadContract = async (
  address: string,
  name: string,
  signer: any
) => {
  const res = await fetch(`/artifacts/contracts/Crowdfund.sol/${name}.json`);
  const Artifact = await res.json();
  let contract = null;

  try {
    contract = new ethers.Contract(address, Artifact.abi, signer);
  } catch {
    console.log(`Contract ${name} cannot be loaded.`);
  }

  return contract;
};
