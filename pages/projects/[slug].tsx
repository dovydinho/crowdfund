import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Moment from 'react-moment';
import { now } from 'moment';

import { MainLayout } from '@components/ui/layouts';
import { useWeb3 } from '@components/web3';
import { Button, DangerButton, LoadingButton } from '@components/ui/common';
import { Edit } from '@components/ui/auth';
import { sanityClient, urlFor } from '@base/sanity';
import { NextPageWithLayout, Project as ProjectTyping } from '@base/typings';

const Project: NextPageWithLayout = ({
  projectSanityData
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [address, setAddress] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [projectContract, setProjectContract] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonUnlockLoading, setButtonUnlockLoading] = useState(false);
  const [buttonDistributeLoading, setButtonDistributeLoading] = useState(false);
  const [buttonAddContributorLoading, setButtonAddContributorLoading] =
    useState(false);
  const [buttonRemoveContributorLoading, setButtonRemoveContributorLoading] =
    useState(false);
  const [amount, setAmount] = useState();
  const router = useRouter();
  const { provider, hooks } = useWeb3();
  const account = hooks.useAccount();

  const slug = router.query.slug;

  useEffect(() => {
    const init = async () => {
      const res = await fetch(
        '/artifacts/contracts/Crowdfund.sol/ProjectCrowdfund.json'
      );
      const Artifacts = await res.json();
      const projectContractInstance = new ethers.Contract(
        slug as string,
        Artifacts.abi,
        provider
      );

      setProjectContract(projectContractInstance);
      const data = await projectContractInstance?.getSummary();
      setProjectData(data);
    };
    provider && ethers.utils.isAddress(slug as string) && init();
  }, [provider, slug]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const sponsor = async () => {
    const txSigner = provider.getSigner(account.data);
    const tx = {
      to: projectContract.address,
      value: ethers.utils.parseUnits(amount, 'ether')
    };
    try {
      const sponsorTX = await txSigner.sendTransaction(tx);
      await sponsorTX.wait();
      const data = await projectContract?.getSummary();
      sanityClient
        .patch(projectSanityData[0]?._id)
        .set({ sponsorsCount: Number(data[5]) })
        .commit();
      setButtonLoading(false);
    } catch (e) {
      setButtonLoading(false);
      console.log('Operation failed.');
    }
  };

  const onSponsorSubmit = (e) => {
    e.preventDefault();
    setButtonLoading(true);
    sponsor();
  };

  const addContributor = async () => {
    setButtonAddContributorLoading(true);
    const txSigner = provider.getSigner(account.data);
    const projectContractWithSigner = projectContract.connect(txSigner);
    try {
      const tx = await projectContractWithSigner.addContributor(address);
      await tx.wait();
      const data = await projectContract?.getSummary();
      sanityClient
        .patch(projectSanityData[0]?._id)
        .set({ contributorsCount: Number(data[7]) })
        .commit();
      setButtonAddContributorLoading(false);
    } catch (err) {
      console.log('Operation failed.');
      setButtonAddContributorLoading(false);
    }
  };

  const onAddContributorSubmit = (e) => {
    e.preventDefault();
    if (ethers.utils.isAddress(address)) {
      addContributor();
    } else alert(`${address} is NOT a valid address`);
  };

  const removeContributor = async (contributorAddress) => {
    const txSigner = provider.getSigner(account.data);
    const projectContractWithSigner = projectContract.connect(txSigner);
    try {
      setButtonRemoveContributorLoading(true);
      const tx = await projectContractWithSigner.removeContributor(
        contributorAddress
      );
      await tx.wait();
      const data = await projectContract?.getSummary();
      sanityClient
        .patch(projectSanityData[0]?._id)
        .set({ contributorsCount: Number(data[7]) })
        .commit();
      setButtonRemoveContributorLoading(false);
    } catch (err) {
      console.log('Operation failed.');
      setButtonRemoveContributorLoading(false);
    }
  };

  const onRemoveContributorSubmit = (e, contributorAddress) => {
    e.preventDefault();
    removeContributor(contributorAddress);
  };

  const unlockAmount = async () => {
    setButtonUnlockLoading(true);
    const txSigner = provider.getSigner(account.data);
    const projectContractWithSigner = projectContract.connect(txSigner);
    try {
      const tx = await projectContractWithSigner.unclockAmount();
      await tx.wait();
      setButtonUnlockLoading(false);
    } catch (err) {
      console.log('Operation failed.');
      setButtonUnlockLoading(false);
    }
  };
  const distributeUnlockedAmount = async () => {
    setButtonDistributeLoading(true);
    const txSigner = provider.getSigner(account.data);
    const projectContractWithSigner = projectContract.connect(txSigner);
    try {
      const tx = await projectContractWithSigner.distribute();
      await tx.wait();
      setButtonDistributeLoading(false);
    } catch (err) {
      console.log('Operation failed.');
      setButtonDistributeLoading(false);
    }
  };

  return (
    <>
      <main className="container">
        <div>
          <div className="bg-gray-900/10 h-36 sm:h-48 md:h-54 lg:h-80 relative z-0 rounded-lg overflow-hidden">
            {projectSanityData[0].backgroundImage.asset._ref && (
              <Image
                src={urlFor(projectSanityData[0].backgroundImage).url()}
                layout="fill"
                alt="Background Image"
              />
            )}
          </div>
          <div className="flex items-center justify-center h-36 w-36 mx-auto -mt-16 rounded-full bg-gray-900 outline outline-8 outline-gray-100/20 relative">
            {projectSanityData[0].avatarImage.asset._ref && (
              <Image
                src={urlFor(projectSanityData[0].avatarImage).url()}
                layout="fill"
                className="rounded-full"
                alt="Avatar Image"
              />
            )}
          </div>
          <div className="mt-8 px-4 max-w-xl mx-auto">
            <div className="flex gap-4 justify-center text-gray-300">
              <p>
                0x
                {projectSanityData[0] &&
                  projectSanityData[0]?.address.slice(2, 6) +
                    `-` +
                    projectSanityData[0]?.address.slice(38, 42)}
              </p>
              <p>{projectSanityData[0]?.targetAmount} ETH / Week</p>
            </div>
            <div className="flex justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest uppercase">
                {projectSanityData[0].title}
              </h1>
              <Edit project={projectSanityData[0]} account={account.data} />
            </div>

            <p className="text-xl text-gray-300 mt-2 overflow-auto pt-4 pb-8">
              {projectSanityData[0].body}
            </p>

            {!account.data && (
              <div className="animate-pulse border border-gray-50/25 flex items-center justify-center py-8 rounded-lg bg-gray-50/20 text-xl text-gray-300">
                Please install Metamask
              </div>
            )}

            {provider && (
              <>
                <div className="w-full font-bold text-center tracking-widest uppercase my-12">
                  <div className="flex justify-center">
                    {projectData[2] && (
                      <h1 className="text-7xl flex items-center">
                        {ethers.utils.formatEther(projectData[2]).toString()}
                      </h1>
                    )}
                    <div className="text-left text-2xl pt-2 my-auto">
                      <h3>ETH</h3>
                      <h3>Balance</h3>
                    </div>
                  </div>

                  <div>
                    <p>
                      Next unlock available{' '}
                      {projectData[8] && (
                        <Moment fromNow>
                          {parseInt(projectData[8]) * 1000}
                        </Moment>
                      )}
                    </p>
                    {projectData[0] &&
                      account.data == projectData[0] &&
                      parseInt(projectData[8]) * 1000 < now() && (
                        <div className="border bg-gray-100/10 border-gray-100/5 py-8 my-4 rounded-lg">
                          <p className="mb-4">
                            Unlocked amount:{' '}
                            {ethers.utils
                              .formatEther(projectData[9])
                              .toString()}{' '}
                            ETH
                          </p>
                          {!buttonUnlockLoading ? (
                            <Button onClick={unlockAmount} name="Unlock" />
                          ) : (
                            <LoadingButton name="Loading..." />
                          )}
                        </div>
                      )}
                    {projectData[0] &&
                      account.data == projectData[0] &&
                      Number(ethers.utils.formatEther(projectData[9])) > 0 && (
                        <div className="border bg-green-500/50 border-gray-100/5 py-8 my-4 rounded-lg">
                          <p className="mb-4">
                            Unlocked amount:{' '}
                            {ethers.utils
                              .formatEther(projectData[9])
                              .toString()}{' '}
                            ETH
                          </p>
                          {!buttonDistributeLoading ? (
                            <Button
                              onClick={distributeUnlockedAmount}
                              name="Distribute"
                            />
                          ) : (
                            <LoadingButton name="Loading..." />
                          )}
                        </div>
                      )}
                  </div>
                </div>
                <form onSubmit={onSponsorSubmit}>
                  <div className="flex gap-4">
                    <input
                      required
                      type="number"
                      min=".000001"
                      placeholder="0.000001"
                      step=".000001"
                      name="amount"
                      onChange={handleAmountChange}
                      className="w-1/2 p-2 rounded-lg bg-gray-100/20 focus:bg-gray-100/25 border border-gray-100/5 focus:outline-none"
                    />
                    {account.data && buttonLoading ? (
                      <LoadingButton name="Sponsor" />
                    ) : (
                      <Button name="Sponsor" />
                    )}
                  </div>
                </form>
              </>
            )}
          </div>

          {provider && (
            <div className="mt-14 flex flex-col sm:flex-row gap-8 text-xl">
              <div className="w-full sm:w-1/2">
                <div className="flex justify-between mb-4">
                  <h1>Contributors</h1>
                  <h1 className="text-gray-300">
                    Total: {projectSanityData[0]?.contributorsCount}
                  </h1>
                </div>
                {
                  <List
                    items={projectData[6]}
                    type="contributors"
                    owner={projectData[0]}
                    onRemoveContributorSubmit={onRemoveContributorSubmit}
                    buttonRemoveContributorLoading={
                      buttonRemoveContributorLoading
                    }
                  />
                }
                {projectData[0] == account.data && (
                  <form onSubmit={onAddContributorSubmit}>
                    <div className="mt-4 flex gap-4">
                      <input
                        required
                        type="text"
                        name="address"
                        placeholder="0x..."
                        onChange={handleAddressChange}
                        className="w-2/3 p-2 rounded-lg bg-gray-100/20 focus:bg-gray-100/25 border border-gray-100/5 focus:outline-none"
                      />

                      {!buttonAddContributorLoading ? (
                        <Button
                          type="submit"
                          className="w-1/3 text-base"
                          name="Add Contributor"
                        />
                      ) : (
                        <LoadingButton className="text-sm" name="Loading..." />
                      )}
                    </div>
                  </form>
                )}
              </div>
              <div className="w-full sm:w-1/2">
                <div className="flex justify-between mb-4">
                  <h1>Sponsors</h1>
                  <h1 className="text-gray-300">
                    Total: {projectSanityData[0]?.sponsorsCount}
                  </h1>
                </div>
                {
                  <List
                    items={projectData[4]}
                    type="sponsors"
                    owner={projectData[0]}
                    onRemoveContributorSubmit={null}
                    buttonRemoveContributorLoading={null}
                  />
                }
              </div>
            </div>
          )}
        </div>
      </main>

      <footer></footer>
    </>
  );
};

export default Project;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context?.params?.slug;
  const query = `*[_type == "projects" && address == "${slug}"]`;
  const projectSanityData = await sanityClient.fetch(query);

  if (projectSanityData.length === 0) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      projectSanityData
    }
  };
};

const List = ({
  items,
  type,
  owner,
  onRemoveContributorSubmit,
  buttonRemoveContributorLoading
}) => {
  const { hooks } = useWeb3();
  const account = hooks.useAccount();
  return (
    <ul className="border-t border-x border-gray-100/5 rounded-lg overflow-hidden">
      {items &&
        items.map((item, i) => {
          return (
            <li
              className="flex justify-between bg-gray-100/10 border-b border-gray-100/5 p-6"
              key={i}
            >
              <p>0x{item[0].slice(2, 6) + `-` + item[0].slice(38, 42)}</p>

              {owner && item[0] == owner && (
                <p className="bg-gray-100/10 border border-gray-100/5 text-base rounded-lg p-2 -my-2">
                  Project Owner
                </p>
              )}
              {type == 'contributors' &&
                owner &&
                account &&
                owner == account.data &&
                owner != item[0] &&
                (buttonRemoveContributorLoading ? (
                  <LoadingButton
                    className="bg-red-500/50 hover:bg-red-500/60 text-base"
                    name="Loading..."
                  />
                ) : (
                  <form onSubmit={(e) => onRemoveContributorSubmit(e, item[0])}>
                    <DangerButton
                      type="submit"
                      className="-my-3 text-base"
                      name="Remove"
                    />
                  </form>
                ))}
              {type == 'sponsors' && (
                <p>{ethers.utils.formatEther(item[1]).toString()} ETH</p>
              )}
            </li>
          );
        })}
      {items && items.length == 0 && (
        <li className="bg-gray-800/10 border-b border-gray-100/5 p-6 text-center">
          There are no sponsors for this project
        </li>
      )}
    </ul>
  );
};

Project.Layout = MainLayout;
