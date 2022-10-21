import { useEffect, useState } from 'react';
import {
  Footer,
  Navbar,
  ScreenSpinner,
  WrongNetwork
} from '@components/ui/common';
import { motion } from 'framer-motion';
import { useWeb3 } from '@components/web3';

export default function MainLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const { isLoading, requireInstall, hooks } = useWeb3();
  const network = hooks.useNetwork();
  const account = hooks.useAccount();

  useEffect(() => {
    setLoading(true);
    !isLoading && setTimeout(() => setLoading(false), 1000);
  }, [isLoading, network.isSupported, account.data]);

  return loading ? (
    <ScreenSpinner />
  ) : network.isSupported ? (
    <main className="container min-h-screen max-w-7xl pb-12 overflow-hidden px-2">
      <motion.div
        initial={{ x: 0, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        {children}
        <Footer />
      </motion.div>
    </main>
  ) : requireInstall ? (
    <main className="container min-h-screen max-w-7xl pb-12 overflow-hidden px-2">
      <motion.div
        initial={{ x: 0, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        {children}
        <Footer />
      </motion.div>
    </main>
  ) : (
    <WrongNetwork network={network} />
  );
}
