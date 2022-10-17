import Web3Provider from '@components/web3';
import { Footer, Navbar } from '@components/ui/common';
import { motion } from 'framer-motion';

export default function MainLayout({ children }) {
  return (
    <Web3Provider>
      <main className="container min-h-screen max-w-7xl pb-12 overflow-hidden">
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
    </Web3Provider>
  );
}
