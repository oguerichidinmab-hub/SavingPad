import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Users,
  Heart,
  Award
} from 'lucide-react';

interface PartnerImpactProps {
  partner: any;
  onBack: () => void;
}

const PartnerImpact: React.FC<PartnerImpactProps> = ({ partner, onBack }) => {
  if (!partner) return null;

  const impactImage = partner.id === 'dwai' ? '/images/dwai-image.jpeg' : `https://picsum.photos/seed/${partner.id}-impact/800/600`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Image */}
      <div className="relative h-72 rounded-[2.5rem] overflow-hidden shadow-xl bg-brand-100">
        <img 
          src={impactImage} 
          alt={`${partner.name} Impact`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/impact-fallback/800/600`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
              Impact Story
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{partner.name}</h2>
          <p className="text-brand-100 text-sm opacity-90 mt-1 flex items-center gap-2">
            <Building2 size={14} /> {partner.type === 'both' ? 'Donor & Educator' : partner.type}
          </p>
        </div>
      </div>

      {/* Stats/Impact Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <p className="text-2xl font-bold text-brand-900">500+</p>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Girls Supported</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-3">
              <Heart size={20} />
            </div>
            <p className="text-2xl font-bold text-brand-900">2,000+</p>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Pads Donated</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-pink-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Detailed Content */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-100 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
            <Award size={20} className="text-brand-500" />
            Our Mission Together
          </h3>
          <p className="text-sm text-brand-700 leading-relaxed">
            {partner.description}
          </p>
        </div>

        <div className="pt-6 border-t border-brand-50 space-y-4">
          <h3 className="text-sm font-bold text-brand-900">Contact Information</h3>
          <div className="space-y-3">
            {partner.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-400 mt-0.5" />
                <p className="text-xs text-brand-600">{partner.address}</p>
              </div>
            )}
            {partner.email && (
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-brand-400" />
                <p className="text-xs text-brand-600">{partner.email}</p>
              </div>
            )}
            {partner.phone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-brand-400" />
                <p className="text-xs text-brand-600">{partner.phone}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-brand-400" />
              <p className="text-xs text-brand-600">{partner.website}</p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <a 
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
          >
            Visit Website <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PartnerImpact;
