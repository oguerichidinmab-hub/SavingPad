import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  User,
  Heart
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface RequestPadProps {
  location: any;
  onBack: () => void;
  onComplete: () => void;
}

const RequestPad: React.FC<RequestPadProps> = ({ location, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    urgency: 'normal',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Firestore
      if (auth.currentUser) {
        await addDoc(collection(db, 'requests'), {
          uid: auth.currentUser.uid,
          locationId: location?.id || 'unknown',
          locationName: location?.name || 'Unknown',
          requesterName: formData.name || 'Anonymous',
          requesterPhone: formData.phone,
          urgency: formData.urgency,
          notes: formData.notes,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }

      // 2. Prepare SMS
      const rawPhone = location?.phone || '';
      const phoneMatch = rawPhone.match(/(\+234|0)\d{10}/);
      const targetPhone = phoneMatch ? phoneMatch[0].replace(/[^\d]/g, '') : '';
      const smsPhone = targetPhone.startsWith('0') ? '+234' + targetPhone.slice(1) : targetPhone;

      const message = `NEW PAD REQUEST\n\nLocation: ${location?.name}\nRequester: ${formData.name || 'Anonymous'}\nPhone: ${formData.phone}\nUrgency: ${formData.urgency.toUpperCase()}\nNotes: ${formData.notes || 'None'}\n\nSent via Pad Bank App`;
      
      const encodedMessage = encodeURIComponent(message);
      const smsUrl = `sms:${smsPhone}?body=${encodedMessage}`;

      // Open SMS app
      window.location.href = smsUrl;
      
      setStep(2);
    } catch (error) {
      console.error("Error submitting request:", error);
      handleFirestoreError(error, OperationType.WRITE, 'requests');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center space-y-6 py-12"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-900">Request Sent!</h2>
          <p className="text-brand-600 text-sm max-w-xs mx-auto">
            Your request has been sent to {location?.name || 'the support point'}. They will contact you shortly.
          </p>
        </div>
        <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100 w-full text-left space-y-3">
          <div className="flex items-center gap-3 text-brand-900 font-bold text-sm">
            <AlertCircle size={18} className="text-brand-500" />
            Next Steps
          </div>
          <ul className="text-xs text-brand-700 space-y-2 list-disc pl-4">
            <li>If your messaging app didn't open automatically, click the button below.</li>
            <li>Keep your phone nearby for a call or SMS.</li>
            <li>You can visit the location during their working hours.</li>
            <li>Your privacy is our priority; the request is discreet.</li>
          </ul>
        </div>
        <div className="w-full space-y-3">
          <button 
            onClick={() => {
              const rawPhone = location?.phone || '';
              const phoneMatch = rawPhone.match(/(\+234|0)\d{10}/);
              const targetPhone = phoneMatch ? phoneMatch[0].replace(/[^\d]/g, '') : '';
              const smsPhone = targetPhone.startsWith('0') ? '+234' + targetPhone.slice(1) : targetPhone;
              const message = `NEW PAD REQUEST\n\nLocation: ${location?.name}\nRequester: ${formData.name || 'Anonymous'}\nPhone: ${formData.phone}\nUrgency: ${formData.urgency.toUpperCase()}\nNotes: ${formData.notes || 'None'}\n\nSent via Pad Bank App`;
              const encodedMessage = encodeURIComponent(message);
              window.location.href = `sms:${smsPhone}?body=${encodedMessage}`;
            }}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            Send via SMS
          </button>
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Summary */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-brand-900">{location?.name || 'Support Point'}</h3>
            <p className="text-xs text-brand-500">{location?.address || 'Abuja, Nigeria'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 p-3 rounded-xl">
          <Phone size={14} />
          <span>Contact: {location?.phone || 'Verified Partner'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Your Name (Optional)</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300" size={18} />
            <input 
              type="text" 
              placeholder="How should we call you?"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300" size={18} />
            <input 
              type="tel" 
              required
              placeholder="For coordination"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Urgency</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setFormData({...formData, urgency: 'normal'})}
              className={`py-3 rounded-xl font-bold text-xs border transition-all ${formData.urgency === 'normal' ? 'bg-brand-600 border-brand-600 text-white shadow-md' : 'bg-white border-brand-100 text-brand-600'}`}
            >
              Normal
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, urgency: 'urgent'})}
              className={`py-3 rounded-xl font-bold text-xs border transition-all ${formData.urgency === 'urgent' ? 'bg-red-500 border-red-500 text-white shadow-md' : 'bg-white border-brand-100 text-red-500'}`}
            >
              Urgent
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Additional Notes</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-brand-300" size={18} />
            <textarea 
              placeholder="Any special requirements?"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Send Request
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-brand-400 mt-4 flex items-center justify-center gap-1">
            <Heart size={10} fill="currentColor" />
            Your dignity and privacy are protected.
          </p>
        </div>
      </form>
    </div>
  );
};

export default RequestPad;
