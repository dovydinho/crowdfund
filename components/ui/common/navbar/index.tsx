import Link from 'next/link';
import { useRouter } from 'next/router';
import cn from 'classnames';

import { useWeb3 } from '@components/web3';
import { Button } from '@components/ui/common';
import { NetworkError } from '@components/ui/noAuth';

function NavItem({ href, text }) {
  const router = useRouter();
  const isActive = router.asPath === href;

  return (
    <Link href={href}>
      <a
        className={cn(
          isActive ? 'font-medium text-gray-100' : 'text-gray-300',
          'p-2 px-4 my-auto hover:bg-gray-100/5 rounded-lg transition-all'
        )}
      >
        <span className="capsize">{text}</span>
      </a>
    </Link>
  );
}

export default function Navbar() {
  const { connect, hooks, requireInstall } = useWeb3();
  const account = hooks.useAccount();

  return (
    <>
      <nav className="flex justify-between py-8">
        <div className="flex gap-2 text-base sm:text-xl">
          <Link href="/">
            <a className="my-auto text-xl sm:text-3xl">Crowdfund</a>
          </Link>
          <NavItem href="/create" text="New Project" />
        </div>
        <div className="flex gap-4">
          {account.data ? (
            <Button
              className="text-sm"
              name={account.data.slice(2, 6) + `-` + account.data.slice(38, 42)}
            />
          ) : requireInstall ? (
            <Link href="https://metamask.io/download">
              <Button name="Install Metamask" />
            </Link>
          ) : (
            <Button onClick={connect} name="Connect" />
          )}
        </div>
      </nav>
      <NetworkError />
    </>
  );
}
