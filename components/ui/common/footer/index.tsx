import { EnvelopeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Cursor, useTypewriter } from 'react-simple-typewriter';

type Props = {};

export default function Footer({}: Props) {
  const [text, count] = useTypewriter({
    words: [
      'Built by Dovydas.io',
      'Custom Web3 Applications',
      'Order yours now'
    ],
    loop: true,
    delaySpeed: 3000
  });
  const sendMail = () => {
    const wndw: Window = window;
    wndw.location = 'mailto:dovydas.lapinskas@tutanota.com';
  };
  return (
    <div className="flex flex-col mt-24 items-center justify-center">
      <h1 className="uppercase tracking-widest text-3xl text-gray-100/25 my-4">
        <span>{text}</span>
        <Cursor cursorColor="orange" />
      </h1>
      <EnvelopeIcon
        onClick={sendMail}
        className="w-10 h-10 hover:scale-110 cursor-pointer"
      />
    </div>
  );
}
