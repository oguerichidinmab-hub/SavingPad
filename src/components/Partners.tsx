import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ExternalLink, 
  Heart, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  type: 'donor' | 'educator' | 'both';
  address?: string;
  phone?: string;
  email?: string;
}

interface PartnersProps {
  onDonate: () => void;
  onPartnerIntro: () => void;
  onLearnMore: (partner: Partner) => void;
}

const Partners: React.FC<PartnersProps> = ({ onDonate, onPartnerIntro, onLearnMore }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const partnersQuery = query(collection(db, 'partners'));

    const unsubscribe = onSnapshot(partnersQuery, (snapshot) => {
      const partnersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
      // Filter for DWAI only
      const filteredPartners = partnersData.filter(p => p.id === 'dwai' || p.name.includes('DWAI'));
      
      if (filteredPartners.length > 0) {
        setPartners(filteredPartners);
      } else {
        // Fallback to mock data if empty
        setPartners([
          {
            id: 'dwai',
            name: 'Deaf Women Aloud Initiative (DWAI)',
            logo: '/images/dwai-image.jpeg',
            description: 'Deaf Women Aloud Initiative (DWAI) is a disability-inclusive organization in Abuja focused on amplifying the voices of Deaf women and girls, promoting inclusion, and improving access to health information and services.',
            website: 'https://deafwomenaloudinitiative.org',
            type: 'both',
            address: 'P&D Plaza, Beside Best Buyer Supermarket, Kuje, Abuja-FCT',
            phone: '+234 803 750 0671',
            email: 'deafwomenaloudinitiative@gmail.com'
          }
        ]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'partners');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donor': return <Heart size={16} className="text-pink-500" />;
      case 'educator': return <BookOpen size={16} className="text-blue-500" />;
      case 'both': return <ShieldCheck size={16} className="text-emerald-500" />;
      default: return <Building2 size={16} className="text-brand-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'donor': return 'Pad Donor';
      case 'educator': return 'Health Educator';
      case 'both': return 'Donor & Educator';
      default: return 'Partner';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Our Partners</h2>
          <p className="text-brand-100 text-sm opacity-90 max-w-[250px]">
            Meet the amazing organizations helping us make menstrual health accessible for everyone.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
        <Globe className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      {/* Partner List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-brand-900">Featured Partners</h3>
          <button 
            onClick={onPartnerIntro}
            className="text-brand-600 text-xs font-bold flex items-center gap-1 bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors"
          >
            Partner with Us <ChevronRight size={14} />
          </button>
        </div>
        {partners.map((partner) => (
          <motion.div 
            key={partner.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 flex flex-col gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-16 h-16 rounded-2xl object-cover border border-brand-50 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-brand-50">
                  {getTypeIcon(partner.type)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                    {getTypeText(partner.type)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-brand-900 leading-tight">{partner.name}</h3>
              </div>
              <a 
                href={partner.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-100 transition-colors shadow-sm"
              >
                <ExternalLink size={20} />
              </a>
            </div>
            
            <p className="text-sm text-brand-700 leading-relaxed">
              {partner.description}
            </p>

            <button 
              onClick={() => onLearnMore(partner)}
              className="w-full py-3 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors group"
            >
              Learn More About Their Impact 
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Donate CTA */}
      <div className="bg-brand-600 p-8 rounded-[2rem] text-center space-y-4 shadow-xl shadow-brand-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-white shadow-sm">
            <Heart size={32} fill="currentColor" />
          </div>
          <h3 className="text-xl font-bold text-white">Support Our Mission</h3>
          <p className="text-sm text-brand-100 max-w-xs mx-auto opacity-90">
            Your donation directly funds sanitary products for girls in need. Every dollar counts.
          </p>
          <button 
            onClick={onDonate}
            className="w-full py-4 bg-white text-brand-600 rounded-2xl font-bold text-sm shadow-lg hover:bg-brand-50 transition-colors"
          >
            Donate Pads Now
          </button>
        </div>
      </div>
    </div>
  );
};

import { Handshake } from 'lucide-react';

export default Partners;
