import Image from 'next/image';
import Link from 'next/link';

import { urlFor } from '@base/sanity';

export default function ProjectCard({ project }) {
  return (
    <Link href={`/projects/${project.address}`}>
      <a className="flex w-full">
        <div className="w-full bg-gray-900/10 hover:bg-gray-700/10 shadow-lg shadow-gray-900/20 rounded-lg border border-gray-100/5 overflow-hidden transition-all">
          <div className="bg-gray-100/5 h-36 relative">
            {project.backgroundImage.asset._ref && (
              <Image
                src={urlFor(project.backgroundImage).url()}
                layout="fill"
                alt="Background Image"
              />
            )}
          </div>
          <div className="flex items-center justify-center h-24 w-24 mx-auto -mt-12 rounded-full bg-gray-900 outline outline-8 outline-gray-100/20 relative">
            {project.avatarImage.asset._ref && (
              <Image
                src={urlFor(project.avatarImage).url()}
                layout="fill"
                className="rounded-full"
                alt="Avatar Image"
              />
            )}
          </div>
          <div className="py-8 px-4">
            <div className="flex gap-4 items-center justify-center text-gray-400 text-sm">
              <p>
                0x
                {project.address.slice(2, 6) +
                  `-` +
                  project.address.slice(38, 42)}
              </p>
              <p>{project.targetAmount} ETH / Week</p>
            </div>
            <h1 className="font-medium text-xl uppercase text-center tracking-widest">
              {project.title}
            </h1>
            <p className="text-gray-400 mt-2 h-24 overflow-auto">
              {project.body}
            </p>
            <div className="flex gap-4">
              <Pill data={`${project.contributorsCount} Contributors`} />
              <Pill data={`${project.sponsorsCount} Sponsors`} />
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}

const Pill = ({ data }) => {
  return (
    <div className="w-1/2 text-center mt-8 bg-gray-100/5 border border-gray-100/5 py-1 rounded-lg">
      {data}
    </div>
  );
};
