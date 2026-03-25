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
  const [step, setStep] = useState<'amount' | 'method' | 'transfer' | 'paystack' | 'processing' | 'success'>('amount');
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'paystack' | null>(null);

  const bankDetails = {
    accountNumber: '0164715566',
    bankName: 'UNION BANK',
    accountName: 'OGUERI BRIDGET CHIDINMA',
  };

  const donationOptions = [
    { value: 5, label: '1 Pack', description: 'Provides pads for one girl for a month' },
    { value: 15, label: '3 Packs', description: 'Supports a girl for an entire term' },
    { value: 50, label: '10 Packs', description: 'Helps a small group of students' },
    { value: 100, label: 'Community', description: 'Supports an entire classroom' },
  ];

  const handleContinueToMethod = () => {
    if (amount || customAmount) {
      setStep('method');
    }
  };

  const handleSelectMethod = (method: 'transfer' | 'paystack') => {
    setPaymentMethod(method);
    setStep(method);
  };

  const handleSent = () => {
    setStep('processing');
    // Simulate payment verification
    setTimeout(() => setStep('success'), 3000);
  };

  const handlePaystackPayment = () => {
    setStep('processing');
    // Simulate Paystack processing
    setTimeout(() => setStep('success'), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-brand-900">Thank You!</h2>
        <p className="text-brand-600 max-w-xs">
          Your donation has been received. You're helping us make menstrual health accessible to those who need it most.
        </p>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

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
            Continue to Payment Method
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      ) : step === 'method' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-brand-900">Choose Payment Method</h3>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleSelectMethod('paystack')}
              className="w-full p-6 bg-white rounded-[2rem] border-2 border-brand-100 hover:border-brand-600 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-brand-900">Paystack</h4>
                  <p className="text-xs text-brand-400">Pay securely with card or bank</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-300 group-hover:text-brand-600 transition-colors" />
            </button>

            <button
              onClick={() => handleSelectMethod('transfer')}
              className="w-full p-6 bg-white rounded-[2rem] border-2 border-brand-100 hover:border-brand-600 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <Building2 size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-brand-900">Bank Transfer</h4>
                  <p className="text-xs text-brand-400">Manual verification required</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-300 group-hover:text-brand-600 transition-colors" />
            </button>
          </div>

          <button 
            onClick={() => setStep('amount')}
            className="w-full py-4 text-brand-500 font-bold text-sm hover:text-brand-700 transition-colors"
          >
            Back to Amount
          </button>
        </div>
      ) : step === 'paystack' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-50/50 space-y-6 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
              <CreditCard size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-brand-900">Pay with Paystack</h3>
              <p className="text-brand-500 text-sm">Securely pay ${amount || customAmount} using Paystack</p>
            </div>
            
            <div className="bg-brand-50 p-4 rounded-2xl flex items-center justify-center gap-2">
              <ShieldCheck size={18} className="text-brand-600" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">PCI-DSS Compliant</span>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={handlePaystackPayment}
                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                Pay Now
              </button>
              <button 
                onClick={() => setStep('method')}
                className="w-full py-4 text-brand-500 font-bold text-sm hover:text-brand-700 transition-colors"
              >
                Change Method
              </button>
            </div>
          </div>
        </div>
      ) : step === 'transfer' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-50/50 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-brand-900">Bank Transfer</h3>
              <p className="text-brand-500 text-sm">Please transfer the amount to the account below</p>
            </div>

            <div className="bg-brand-50/50 rounded-3xl p-6 space-y-4 border border-brand-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Account Number</p>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-brand-100">
                  <span className="text-xl font-mono font-bold text-brand-900 tracking-wider">{bankDetails.accountNumber}</span>
                  <button 
                    onClick={copyToClipboard}
                    className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'}`}
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Bank Name</p>
                  <p className="font-bold text-brand-900">{bankDetails.bankName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Account Name</p>
                  <p className="font-bold text-brand-900">{bankDetails.accountName}</p>
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
          <div className="bg-white p-12 rounded-[2.5rem] border border-brand-100 shadow-sm text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 border-4 border-brand-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                <Loader2 size={32} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-brand-900">Verifying Transfer</h3>
              <p className="text-brand-500 text-sm max-w-[200px] mx-auto">Please wait while our team verifies your bank transfer...</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-brand-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Secure Verification Process</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;
