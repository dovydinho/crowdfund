import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

import { Button, DangerButton } from '@components/ui/common';
import { sanityClient } from '@base/sanity';
import { CreateFormData } from '@base/typings';

export default function Edit({ project, account }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(project?.title);
  const [body, setBody] = useState(project?.body);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateFormData>();

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.code === 'Escape') {
        setShowModal(false);
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  if (project?.creator._ref != account) {
    return;
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const onSubmit = async (data) => {
    try {
      sanityClient
        .patch(project?.address)
        .set({ title: title, body: body })
        .commit();
      setShowModal(false);
    } catch {
      console.log('Operation failed.');
    }
  };

  return (
    <>
      <Cog6ToothIcon
        onClick={() => setShowModal(true)}
        className="hover:animate-spin w-10 h-10 ml-1 cursor-pointer text-blue-300"
      />
      {showModal ? (
        <>
          <div className="fixed inset-0 z-20 overflow-y-auto text-lg">
            <div
              className="fixed inset-0 w-full h-full bg-black opacity-40"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="flex items-center min-h-screen">
              <div className="relative w-full max-w-2xl p-12 mx-auto bg-gradient-to-r from-[#41295a]/95 to-[#2F0743]/95 rounded-lg border-4 border-[#41295a]">
                <h1 className="text-center text-3xl mb-4">Update Content</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-5">
                    <input
                      {...register('title', {
                        required: 'Project title is required',
                        minLength: {
                          value: 3,
                          message:
                            'Project title should be at least 3 characters'
                        },
                        maxLength: {
                          value: 30,
                          message:
                            'Project title should not exceed 30 characters'
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
                      value={title}
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
                      placeholder={'Describe your project...'}
                      onChange={handleBodyChange}
                      value={body}
                    />
                    {errors.body && (
                      <div className="text-sm text-red-600">
                        {errors.body?.message}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <Button type="submit" name="Update" />
                    <DangerButton
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModal(false);
                      }}
                      name="Cancel"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
