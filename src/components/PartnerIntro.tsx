import React from 'react';
import { motion } from 'motion/react';
import { 
  Handshake, 
  Heart, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  Users,
  ShieldCheck,
  Target
} from 'lucide-react';
import { PARTNER_FORM_URL } from '../constants/config';

interface PartnerIntroProps {
  onBack: () => void;
}

const PartnerIntro: React.FC<PartnerIntroProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-brand-900">Become a Partner</h2>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-200 relative overflow-hidden text-center"
      >
        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto text-white shadow-sm border border-white/30">
            <Handshake size={40} />
          </div>
          <h3 className="text-2xl font-bold">Join the Movement</h3>
          <p className="text-brand-100 text-sm leading-relaxed opacity-90 max-w-xs mx-auto">
            Together, we can end period poverty and ensure every girl has access to safe menstrual products.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/20 rounded-full -ml-16 -mb-16 blur-3xl" />
      </motion.div>

      {/* Why Partner? Section */}
      <div className="space-y-6">
        <div className="px-2">
          <h4 className="text-lg font-bold text-brand-900">Why Partner with Us?</h4>
          <p className="text-sm text-brand-500 mt-1">Your partnership creates lasting change in rural communities.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-100 flex items-start gap-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
              <Heart size={24} />
            </div>
            <div>
              <h5 className="font-bold text-brand-900">Direct Impact</h5>
              <p className="text-xs text-brand-600 mt-1 leading-relaxed">
                Your support directly funds the distribution of sanitary pads to girls in FCT schools for special needs and rural areas.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-100 flex items-start gap-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <Target size={24} />
            </div>
            <div>
              <h5 className="font-bold text-brand-900">Community Empowerment</h5>
              <p className="text-xs text-brand-600 mt-1 leading-relaxed">
                Help us provide essential menstrual health education and break the stigma surrounding periods in our society.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-100 flex items-start gap-4 shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h5 className="font-bold text-brand-900">Trusted Network</h5>
              <p className="text-xs text-brand-600 mt-1 leading-relaxed">
                Join a verified network of organizations like DWAI, working together for a common goal of inclusive health access.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm space-y-6 text-center">
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-brand-900">Ready to make a difference?</h4>
          <p className="text-sm text-brand-500">Fill out our partnership application form to get started.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.open(PARTNER_FORM_URL, '_blank')}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors group"
          >
            Apply via Google Form
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[10px] text-brand-400">
            By clicking, you will be redirected to an external Google Form.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerIntro;
