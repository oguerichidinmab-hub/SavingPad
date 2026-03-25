import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  User,
  Camera
} from 'lucide-react';
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface ShareStoryProps {
  onBack: () => void;
  onComplete: () => void;
}

const ShareStory: React.FC<ShareStoryProps> = ({ onBack, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    story: '',
    image: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age) {
      alert("Please include your age.");
      return;
    }

    setLoading(true);

    try {
      let currentUser = auth.currentUser;

      // If not signed in, try to sign in anonymously (for guests)
      if (!currentUser) {
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
        } catch (authErr: any) {
          console.error("Anonymous sign-in failed:", authErr);
          if (authErr.code === 'auth/admin-restricted-operation') {
            throw new Error("Guest sharing is currently disabled. Please enable 'Anonymous Authentication' in your Firebase Console or sign in with an account to share your story.");
          }
          throw new Error("You must be signed in to share a story. Please go to your profile to sign in or create an account.");
        }
      }

      if (!currentUser) {
        throw new Error("Authentication failed. Please try again or sign in from your profile.");
      }

      const authorName = formData.name || 'Anonymous';
      const authorDisplay = `${authorName}, ${formData.age}`;

      await addDoc(collection(db, 'success_stories'), {
        content: formData.story,
        author: authorDisplay,
        age: parseInt(formData.age),
        uid: currentUser.uid,
        image: formData.image || `https://picsum.photos/seed/${Date.now()}/100/100`,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error sharing story:", error);
      
      // If it's our custom error, show it directly
      if (error.message && (error.message.includes("signed in") || error.message.includes("failed"))) {
        alert(error.message);
      } else if (error.message && error.message.includes("permissions")) {
        alert("Permission denied. Please ensure you are signed in from your profile.");
      } else {
        alert("Failed to share story. Please check your connection and try again.");
      }
      
      handleFirestoreError(error, OperationType.WRITE, 'success_stories');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onComplete]);

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center space-y-6 py-12 bg-white rounded-[3rem] shadow-xl border border-brand-100 p-8"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-900">Story Shared!</h2>
          <p className="text-brand-600 text-sm max-w-xs mx-auto">
            Thank you for sharing your impact story. Your experience inspires others in our community.
          </p>
        </div>
        <div className="w-full space-y-4">
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-colors"
          >
            Back to Community
          </button>
          <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest animate-pulse">
            Redirecting in a few seconds...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="font-bold text-brand-900">Share Your Impact</h3>
            <p className="text-xs text-brand-500">Tell others how Saving Pad helped you</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-2">
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
            <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Age *</label>
            <div className="relative">
              <input 
                type="number" 
                required
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-4 py-4 bg-white border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Your Story</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-brand-300" size={18} />
            <textarea 
              required
              placeholder="Tell us about your experience..."
              rows={5}
              value={formData.story}
              onChange={(e) => setFormData({...formData, story: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-400 uppercase tracking-wider ml-1">Add a Photo (Optional)</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-brand-50 rounded-2xl border-2 border-dashed border-brand-200 flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-brand-300" />
              )}
            </div>
            <label className="px-4 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-brand-600 cursor-pointer hover:bg-brand-50 transition-colors">
              Choose Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
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
                Share Impact Story
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShareStory;
