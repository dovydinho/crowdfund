import type { GetServerSideProps } from 'next';
import { ProjectCard } from '@components/ui/common';
import { MainLayout } from '@components/ui/layouts';
import classNames from 'classnames';
import {
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { sanityClient } from '../sanity';
import { Project } from '@base/typings';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper';
interface Props {
  projectsCollection: Project[];
}

const Home = ({ projectsCollection }: Props) => {
  const [hydrated, setHydrated] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredProjects = projectsCollection.filter((project) =>
    project?.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const keyDownHandler = (e: any) => {
      if (e?.code === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <div>
        <section className="flex">
          <div className="flex mx-auto">
            <input
              type="text"
              onClick={() => {
                searchValue.length > 0 && setSearchOpen(true);
              }}
              onChange={(e) => {
                e.target.value?.length > 0
                  ? setSearchOpen(true)
                  : setSearchOpen(false);
                setSearchValue(e.target.value);
              }}
              className={classNames(
                'py-2 px-8 mx-auto border-l border-y focus:outline-none rounded-l-lg',
                'text-gray-100 bg-gray-100/10 border-gray-100/5 hover:bg-gray-100/20 focus:bg-gray-100/20 transition-all'
              )}
            />
            <div className="grid items-center border-y border-r border-gray-100/5 px-2 rounded-r-lg bg-gray-100/10">
              {!searchOpen ? (
                <MagnifyingGlassIcon className="h-7 w-7 my-auto text-gray-400" />
              ) : (
                <XCircleIcon
                  onClick={() => setSearchOpen(false)}
                  className="h-7 w-7 my-auto text-red-400"
                />
              )}
            </div>
          </div>
        </section>
        {searchOpen && (
          <section id="searchModal">
            <div className="absolute z-10 w-[33rem] text-center p-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#41295a] to-[#41295a]/95 rounded-lg border border-[#41295a]">
              {filteredProjects.length > 0 ? (
                <Swiper
                  slidesPerView={1}
                  spaceBetween={20}
                  slidesPerGroup={1}
                  loop={true}
                  loopFillGroupWithBlank={true}
                  pagination={{
                    enabled: false,
                    clickable: true
                  }}
                  navigation={true}
                  modules={[Pagination, Navigation]}
                >
                  {filteredProjects.map((project, i) => (
                    <SwiperSlide key={i}>
                      <ProjectCard project={project} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="flex items-center justify-center">
                  <MagnifyingGlassMinusIcon className="w-6 h-6 mr-1" />
                  <h1 className="py-4">Nothing found.</h1>
                </div>
              )}
            </div>
          </section>
        )}
        {projectsCollection.length > 0 ? (
          <section className="mt-12">
            <Swiper
              // slidesPerView={3}
              spaceBetween={20}
              slidesPerGroup={1}
              loop={true}
              loopFillGroupWithBlank={true}
              pagination={{
                enabled: false,
                clickable: true
              }}
              navigation={true}
              modules={[Pagination, Navigation]}
              breakpoints={{
                640: {
                  slidesPerView: 1
                },
                768: {
                  slidesPerView: 2
                },
                1024: {
                  slidesPerView: 3
                }
              }}
            >
              {projectsCollection.map((project, i) => (
                <SwiperSlide key={i}>
                  <ProjectCard project={project} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : (
          <section className="flex items-center justify-center mt-12 text-gray-500">
            <XCircleIcon className="w-10 h-10 -mb-1 mr-2" />
            <h1 className="text-center my-24 text-3xl">
              No Projects Available
            </h1>
          </section>
        )}
      </div>
      <footer></footer>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "projects"] | order(publishedAt)`;

  const projectsCollection = await sanityClient.fetch(query);

  return {
    props: {
      projectsCollection: projectsCollection.reverse()
    }
  };
};

Home.Layout = MainLayout;
