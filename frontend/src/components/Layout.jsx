import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;