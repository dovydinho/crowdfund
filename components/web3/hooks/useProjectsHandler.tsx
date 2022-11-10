import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const handler = (provider: any, contract: any) => () => {
  const [allProjects, setAllProjects] = useState([]);
  const [projectContracts, setProjectContracts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const deployedProjects = await contract.getProjects();
      setAllProjects(deployedProjects);
    };
    contract && init();
  }, [contract]);

  useEffect(() => {
    const init = async () => {
      let res = await fetch(
        '/artifacts/contracts/Crowdfund.sol/ProjectCrowdfund.json'
      );
      let Artifact = await res.json();
      let projectContractInstance = (address: string) =>
        new ethers.Contract(address, Artifact.abi, provider);

      let callGetSummary: any = [];
      for (let i = 0; i < allProjects.length; i++) {
        let book = await projectContractInstance(allProjects[i]);
        callGetSummary = await book.getSummary();
        console.log(callGetSummary);
        !projectContracts.includes(callGetSummary) &&
          setProjectContracts((projectContracts) => [
            callGetSummary,
            ...projectContracts
          ]);
      }
    };
    provider && allProjects.length > 0 && init();
  }, [provider, allProjects.length]);

  return projectContracts;
};
