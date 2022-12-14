import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { ContractFactory, ethers } from 'ethers';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';

import { Button, LoadingButton } from '@components/ui/common';
import { useWeb3 } from '@components/web3';
import { MainLayout } from '@components/ui/layouts';
import { sanityClient } from '@base/sanity';
import { CreateFormData, NextPageWithLayout } from '@base/typings';

const Create: NextPageWithLayout = () => {
  const [targetAmount, setTargetAmount] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const [avatarObjectURL, setAvatarObjectURL] = useState(null);
  const [backgroundObjectURL, setBackgroundObjectURL] = useState(null);

  const router = useRouter();
  const { connect, contract, provider, hooks, requireInstall } = useWeb3();
  const account = hooks.useAccount();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateFormData>();

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value);
  };
  const handleBodyChange = (e: any) => {
    setBody(e.target.value);
  };
  const handleTargetChange = (e: any) => {
    setTargetAmount(e.target.value);
  };

  const onSubmit = async (data: CreateFormData) => {
    setButtonLoading(true);
    const amount = ethers.utils.parseEther(targetAmount);
    try {
      const res = await fetch(
        `/artifacts/contracts/Crowdfund.sol/ProjectCrowdfund.json`
      );
      const Artifact = await res.json();
      const signer = provider.getSigner();
      const factory = new ContractFactory(
        Artifact.abi,
        Artifact.bytecode,
        signer
      );
      const newProjectContract = await factory.deploy(
        contract.address,
        account.data,
        amount
      );
      await newProjectContract.deployTransaction.wait();
      saveProject(data.title, data.body, newProjectContract.address);
      router.push('/');
      // router.push(`/projects/${newProjectContract.address}`);
    } catch {
      setButtonLoading(false);
      console.log('Operation failed.');
    }
  };

  const saveProject = async (title: string, body: string, _address: string) => {
    const projectDoc = {
      _type: 'projects',
      _id: _address,
      title: title,
      address: _address,
      creator: {
        _type: 'reference',
        _ref: account.data
      },
      avatarImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: avatarImage?._id
        }
      },
      backgroundImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: backgroundImage?._id
        }
      },
      body: body,
      targetAmount: Number(targetAmount),
      contributorsCount: 1,
      sponsorsCount: 0
    };
    await sanityClient.createIfNotExists(projectDoc);
  };

  const uploadImage = (e: FormEvent) => {
    const event = e.target as HTMLInputElement;
    const selectedImage = event.files[0];

    sanityClient.assets
      .upload('image', selectedImage, {
        contentType: selectedImage?.type,
        filename: selectedImage?.name
      })
      .then((document) => {
        if (event.name === 'avatarImage') {
          setAvatarImage(document);
          setAvatarObjectURL(URL.createObjectURL(selectedImage));
        } else if (event.name === 'backgroundImage') {
          setBackgroundImage(document);
          setBackgroundObjectURL(URL.createObjectURL(selectedImage));
        }
      })
      .catch((error) => {
        console.log('Upload failed:', error.message);
      });
    return;
  };

  return (
    <>
      <main className="container">
        <section className="my-10">
          <div className="lg:flex gap-8">
            <div className="w-full lg:w-1/2 xl:w-3/5">
              <h1 className="text-3xl sm:text-4xl text-center py-8 tracking-widest">
                Create New Project
              </h1>
              <form onSubmit={handleSubmit(onSubmit)} className="p-1">
                <div className="mb-5">
                  <input
                    {...register('title', {
                      required: 'Project title is required',
                      minLength: {
                        value: 3,
                        message: 'Project title should be at least 3 characters'
                      },
                      maxLength: {
                        value: 30,
                        message: 'Project title should not exceed 30 characters'
                      }
                    })}
                    className={classNames(
                      'w-full bg-gray-100/10 focus:bg-gray-100/20 px-8 py-4 border border-gray-100/10 rounded-lg',
                      `${
                        errors.title
                          ? 'outline outline-2 outline-red-600 placeholder:text-red-600'
                          : 'focus:outline-none'
                      }`
                    )}
                    placeholder="Project name..."
                    onChange={handleTitleChange}
                  />
                  {errors.title && (
                    <div className="text-sm text-red-600 mt-2">
                      {errors.title?.message}
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <textarea
                    {...register('body', {
                      required: 'Project description is required',
                      minLength: {
                        value: 3,
                        message:
                          'Project description should be at least 3 characters'
                      },
                      maxLength: {
                        value: 250,
                        message:
                          'Project description should not exceed 250 characters'
                      }
                    })}
                    className={classNames(
                      'w-full bg-gray-100/10 focus:bg-gray-100/20 px-8 py-4 border border-gray-100/10 rounded-lg',
                      `${
                        errors.body
                          ? 'outline outline-2 outline-red-600 placeholder:text-red-600'
                          : 'focus:outline-none'
                      }`
                    )}
                    rows={5}
                    placeholder="Describe your project..."
                    onChange={handleBodyChange}
                  />
                  {errors.body && (
                    <div className="text-sm text-red-600">
                      {errors.body?.message}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="avatarImage" className="block">
                    Avatar
                  </label>
                  <input
                    {...register('avatarImage', {
                      validate: {
                        fileHasName: (files) =>
                          files[0]?.name.length > 0 || 'No file provided',
                        lessThan10MB: (files) =>
                          files[0]?.size < 100000 || 'Max 100kb'
                      }
                    })}
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={uploadImage}
                  />
                  {errors.avatarImage && (
                    <div className="text-sm text-red-600 mt-2">
                      {errors.avatarImage?.message}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="backgroundImage" className="block mt-4">
                    Background
                  </label>
                  <input
                    {...register('backgroundImage', {
                      validate: {
                        fileHasName: (files) =>
                          files[0]?.name.length > 0 || 'No file provided',
                        lessThan10MB: (files) =>
                          files[0]?.size < 300000 || 'Max 300kb'
                      }
                    })}
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={uploadImage}
                  />
                  {errors.backgroundImage && (
                    <div className="text-sm text-red-600 mt-2">
                      {errors.backgroundImage?.message}
                    </div>
                  )}
                </div>
                <label htmlFor="targetAmount" className="block mt-4">
                  Target Amount
                </label>
                <div className="mb-5">
                  <input
                    {...register('targetAmount', {
                      required: 'Target amount is required',
                      min: {
                        value: 0.000001,
                        message: 'Target amount should be at least 0.000001 ETH'
                      },
                      max: {
                        value: 10,
                        message: 'Target amount should be up to 10 ETH'
                      }
                    })}
                    className={classNames(
                      'w-full bg-gray-100/10 focus:bg-gray-100/20 px-8 py-4 border border-gray-100/10 rounded-lg',
                      `${
                        errors.targetAmount
                          ? 'outline outline-2 outline-red-600 placeholder:text-red-600'
                          : 'focus:outline-none'
                      }`
                    )}
                    type="number"
                    step=".000001"
                    placeholder="0.25"
                    onChange={handleTargetChange}
                  />
                  {errors.targetAmount && (
                    <div className="text-red-600 mt-1">
                      {errors.targetAmount?.message}
                    </div>
                  )}
                </div>

                {account.data &&
                  (buttonLoading ? (
                    <LoadingButton name="Creating..." />
                  ) : (
                    <Button name="Create Project" type="submit" />
                  ))}
              </form>
              {!account.data &&
                (requireInstall ? (
                  <Button name="Install Metamask" />
                ) : (
                  <Button onClick={connect} name="Connect" />
                ))}
            </div>

            <div className="w-full lg:w-1/2 xl:w-2/5 py-8 px-8 sm:px-24 md:px-36 lg:px-16">
              <h1 className="text-3xl text-center py-8 tracking-widest">
                Live Preview
              </h1>

              <div className="w-full bg-gray-900/10 hover:bg-gray-700/10 shadow-lg shadow-gray-900/20 rounded-lg border border-gray-100/5 overflow-hidden transition-all cursor-pointer">
                <div className="bg-gray-100/5 h-36 relative">
                  {backgroundObjectURL && (
                    <Image
                      src={backgroundObjectURL}
                      layout="fill"
                      alt="Background Image"
                    />
                  )}
                </div>
                <div className="flex items-center justify-center h-24 w-24 mx-auto -mt-12 rounded-full bg-gray-900 outline outline-8 outline-gray-100/20 relative">
                  {avatarObjectURL && (
                    <Image
                      src={avatarObjectURL}
                      layout="fill"
                      className="rounded-full"
                      alt="Avatar Image"
                    />
                  )}
                </div>
                <div className="py-8 px-4">
                  <div className="flex gap-4 items-center justify-center text-gray-400 text-sm">
                    <p>0x0000-0000</p>
                    <p>{targetAmount ? targetAmount : '0'} ETH / Week</p>
                  </div>
                  <h1 className="font-medium text-xl uppercase text-center tracking-widest">
                    {title ? title : 'Project name...'}
                  </h1>
                  <p className="text-gray-400 mt-2 h-24 overflow-auto">
                    {body ? body : 'Describe your project...'}
                  </p>
                  <div className="flex gap-4">
                    <Pill data="1 Contributors" />
                    <Pill data="0 Sponsors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer></footer>
    </>
  );
};

export default Create;

Create.Layout = MainLayout;

const Pill = ({ data }: { data: string }) => {
  return (
    <div className="w-1/2 text-center mt-8 bg-gray-100/5 border border-gray-100/5 py-1 rounded-lg">
      {data}
    </div>
  );
};
