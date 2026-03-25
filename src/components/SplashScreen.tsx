import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand-600 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6"
      >
        <Heart size={64} className="text-white" fill="white" />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white tracking-tight">Saving Pad</h1>
        <p className="text-brand-100 mt-2 font-medium opacity-80">Empowering every girl</p>
      </motion.div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default SplashScreen;
