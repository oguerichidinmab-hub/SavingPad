import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  CreditCard, 
  Building2,
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Gift,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface DonateProps {
  onBack: () => void;
}

const Donate: React.FC<DonateProps> = ({ onBack }) => {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'transfer' | 'whatsapp'>('amount');
  const [copiedUSD, setCopiedUSD] = useState(false);
  const [copiedNaira, setCopiedNaira] = useState(false);

  const bankDetails = {
    usd: {
      accountNumber: '5075389867',
      bankName: 'Zenith bank',
      accountName: 'Technology Beyond Disability Initiative',
      label: 'Dollar Account'
    },
    naira: {
      accountNumber: '1310216480',
      bankName: 'Zenith bank',
      accountName: 'Technology Beyond Disability Initiative',
      label: 'Naira Account'
    }
  };

  const donationOptions = [
    { value: 5, label: '1 Pack', description: 'Provides pads for one girl for a month' },
    { value: 15, label: '3 Packs', description: 'Supports a girl for an entire term' },
    { value: 50, label: '10 Packs', description: 'Helps a small group of students' },
    { value: 100, label: 'Community', description: 'Supports an entire classroom' },
  ];

  const handleContinueToMethod = () => {
    if (amount || customAmount) {
      setStep('transfer');
    }
  };

  const handleSent = () => {
    setStep('whatsapp');
  };

  const copyToClipboard = (text: string, type: 'usd' | 'naira') => {
    navigator.clipboard.writeText(text);
    if (type === 'usd') {
      setCopiedUSD(true);
      setTimeout(() => setCopiedUSD(false), 2000);
    } else {
      setCopiedNaira(true);
      setTimeout(() => setCopiedNaira(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <button 
        onClick={onBack}
        className="text-brand-500 text-sm font-bold flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="bg-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Donate Pads</h2>
          <p className="text-brand-100 text-sm opacity-90 max-w-[250px]">
            Your contribution directly funds sanitary products for girls in need.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <Gift className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      {step === 'amount' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-brand-900">Select Amount</h3>
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Secure Payment</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {donationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAmount(option.value);
                  setCustomAmount('');
                }}
                className={`p-5 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                  amount === option.value 
                    ? 'border-brand-600 bg-brand-50 shadow-md' 
                    : 'border-brand-100 bg-white hover:border-brand-300'
                }`}
              >
                {amount === option.value && (
                  <div className="absolute top-3 right-3 text-brand-600">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                <p className="text-2xl font-bold text-brand-900">${option.value}</p>
                <p className="font-bold text-brand-600 text-[10px] uppercase tracking-wider mt-1">{option.label}</p>
                <p className="text-[10px] text-brand-400 mt-3 leading-tight font-medium">{option.description}</p>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-sm">
            <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3 ml-1">Custom Amount</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-400">
                <DollarSign size={20} />
              </div>
              <input 
                type="number" 
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(null);
                }}
                className="w-full pl-12 pr-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-brand-900 text-lg"
              />
            </div>
          </div>

          <button 
            onClick={handleContinueToMethod}
            disabled={!amount && !customAmount}
            className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 group"
          >
            Proceed to Transfer
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      ) : step === 'transfer' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-50/50 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-brand-900">Bank Transfer</h3>
              <p className="text-brand-500 text-sm">Please transfer the amount to the account below</p>
            </div>

            <div className="bg-brand-50/50 rounded-3xl p-6 space-y-6 border border-brand-100">
              {/* USD Account */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{bankDetails.usd.label}</p>
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{bankDetails.usd.bankName}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-sm font-bold text-brand-900 mb-3">{bankDetails.usd.accountName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono font-bold text-brand-900 tracking-wider">{bankDetails.usd.accountNumber}</span>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.usd.accountNumber, 'usd')}
                      className={`p-2 rounded-xl transition-all ${copiedUSD ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'}`}
                    >
                      {copiedUSD ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Naira Account */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{bankDetails.naira.label}</p>
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{bankDetails.naira.bankName}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-sm font-bold text-brand-900 mb-3">{bankDetails.naira.accountName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono font-bold text-brand-900 tracking-wider">{bankDetails.naira.accountNumber}</span>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.naira.accountNumber, 'naira')}
                      className={`p-2 rounded-xl transition-all ${copiedNaira ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'}`}
                    >
                      {copiedNaira ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="bg-brand-600/5 p-4 rounded-2xl border border-brand-600/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest leading-none mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-brand-900">${amount || customAmount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSent}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                I have sent the money
              </button>
              <button 
                onClick={() => setStep('amount')}
                className="w-full py-4 text-brand-500 font-bold text-sm hover:text-brand-700 transition-colors"
              >
                Change Amount
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-brand-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Secure Manual Verification</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-50/50 space-y-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-brand-900">Verify Your Donation</h3>
              <p className="text-brand-500 text-sm max-w-[250px] mx-auto">
                Please send a screenshot of your transfer receipt to our WhatsApp for verification.
              </p>
            </div>
            
            <div className="bg-brand-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">WhatsApp Contact</span>
              <p className="font-bold text-brand-900 text-sm">Technology Beyond Disability Initiative</p>
              <p className="font-mono text-brand-600 font-bold mt-1">+234 816 652 1621</p>
            </div>

            <div className="space-y-3 pt-4">
              <a 
                href="https://wa.me/2348166521621?text=Hi,%20I%20just%20donated%20to%20Saving%20Pad.%20Here%20is%20my%20receipt:"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
              >
                Message on WhatsApp <ExternalLink size={18} />
              </a>
              <button 
                onClick={onBack}
                className="w-full py-4 text-brand-500 font-bold text-sm hover:text-brand-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;
