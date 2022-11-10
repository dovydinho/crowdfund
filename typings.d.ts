import { NextPage } from 'next';

export interface NextPageWithLayout extends NextPage {
  Layout: any;
}

export interface CreateFormData {
  title: string;
  body: string;
  avatarImage: File;
  backgroundImage: File;
  targetAmount: string;
}

interface SanityBody {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
}

interface Creator {
  _ref: string;
  _type: 'reference';
}

interface Image {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

export interface Project extends SanityBody {
  _type: 'projects';
  address: string;
  avatarImage: Image;
  backgroundImage: Image;
  body: string;
  contributorsCount: number;
  creator: Creator;
  sponsorsCount: number;
  targetAmount: number;
  title: string;
}

export interface User extends SanityBody {
  _type: 'users';
  address: string;
  name: string;
  bio: string;
  avatarImage: Image;
}
