import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Bell, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Sparkles,
  Info,
  User,
  Lock
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: '',
    notificationsEnabled: true,
    padReminders: true,
    username: '',
    password: '',
    isLogin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => {
    if (step === 3) { // Account step
      if (!formData.username || !formData.password) {
        setError("Please enter a username and password");
        return;
      }
      if (formData.username.length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError("Username can only contain letters, numbers, and underscores");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    setError(null);
    setStep((s) => s + 1);
  };
  const prevStep = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = `${formData.username.trim().toLowerCase()}@savingpad.app`;
      let userCredential;

      if (formData.isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      }

      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: formData.username.trim(),
        cycleLength: formData.cycleLength,
        periodLength: formData.periodLength,
        lastPeriodStart: formData.lastPeriodStart,
        preferences: {
          notificationsEnabled: formData.notificationsEnabled,
          padReminders: formData.padReminders,
        },
        isGuest: false,
        createdAt: new Date().toISOString(), // Use ISO string for more reliable local/remote sync
      };
      
      // Save to local storage first for immediate UI update
      localStorage.setItem('saving_pad_profile', JSON.stringify(userData));
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          createdAt: serverTimestamp() // Use real server timestamp in DB
        });
      } catch (dbErr: any) {
        console.error("Database error:", dbErr);
        // If DB write fails but auth succeeded, we still have local profile
        // We'll continue but warn in console
      }
      
      onComplete();
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "An error occurred during authentication.";
      
      if (err.code === 'auth/email-already-in-use') {
        message = "Username already taken. Try logging in instead.";
      } else if (err.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      } else if (err.code === 'auth/user-not-found') {
        message = "User not found. Try signing up.";
      } else if (err.code === 'auth/network-request-failed') {
        message = "Network error. Please check your internet connection.";
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    const guestData = {
      uid: 'guest_' + Math.random().toString(36).substr(2, 9),
      displayName: 'Guest User',
      cycleLength: formData.cycleLength,
      periodLength: formData.periodLength,
      lastPeriodStart: formData.lastPeriodStart,
      preferences: {
        notificationsEnabled: formData.notificationsEnabled,
        padReminders: formData.padReminders,
      },
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('saving_pad_profile', JSON.stringify(guestData));
    onComplete();
  };

  const steps = [
    // Step 0: Welcome
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
        <Heart size={48} fill="currentColor" />
      </div>
      <h1 className="text-3xl font-bold text-brand-900">Welcome to Saving Pad</h1>
      <p className="text-brand-700 max-w-xs">
        Your friendly companion for menstrual health, cycle tracking, and finding resources nearby.
      </p>
      <button 
        onClick={nextStep}
        className="w-full py-4 bg-brand-600 text-white rounded-2xl font-semibold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
      >
        Let's Get Started <ChevronRight size={20} />
      </button>
    </div>,

    // Step 1: Tutorial - Tracking
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
        <Calendar size={48} />
      </div>
      <h2 className="text-2xl font-bold text-brand-900">Track Your Cycle</h2>
      <p className="text-brand-700 max-w-xs">
        Log your periods and symptoms to get accurate predictions and understand your body better.
      </p>
      <div className="flex gap-4 w-full">
        <button onClick={prevStep} className="flex-1 py-4 bg-white border border-brand-200 text-brand-600 rounded-2xl font-semibold">Back</button>
        <button onClick={nextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-semibold">Next</button>
      </div>
    </div>,

    // Step 2: Tutorial - Find Pads
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
        <MapPin size={48} />
      </div>
      <h2 className="text-2xl font-bold text-brand-900">Find Pads Nearby</h2>
      <p className="text-brand-700 max-w-xs">
        Locate free or affordable sanitary pads at schools, NGOs, and community centers near you.
      </p>
      <div className="flex gap-4 w-full">
        <button onClick={prevStep} className="flex-1 py-4 bg-white border border-brand-200 text-brand-600 rounded-2xl font-semibold">Back</button>
        <button onClick={nextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-semibold">Next</button>
      </div>
    </div>,

    // Step 3: Account Creation
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-brand-900">
          {formData.isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-brand-600 text-sm">
          {formData.isLogin ? 'Log in to sync your data' : 'Save your progress and sync across devices'}
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-2">
            <Info size={14} />
            {error}
          </div>
        )}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={20} />
          <input 
            type="text" 
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full p-4 pl-12 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={20} />
          <input 
            type="password" 
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-4 pl-12 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <button 
          onClick={() => setFormData({...formData, isLogin: !formData.isLogin})}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
        >
          {formData.isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </div>

      <div className="flex gap-4 w-full pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-white border border-brand-200 text-brand-600 rounded-2xl font-semibold">Back</button>
        <button onClick={nextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-semibold">Next</button>
      </div>
    </div>,

    // Step 4: Cycle Preferences
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-brand-900">Tell us about your cycle</h2>
        <p className="text-brand-600 text-sm">This helps us give you better predictions.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Average Cycle Length (days)</label>
          <input 
            type="number" 
            value={formData.cycleLength}
            onChange={(e) => setFormData({...formData, cycleLength: parseInt(e.target.value)})}
            className="w-full p-4 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Average Period Duration (days)</label>
          <input 
            type="number" 
            value={formData.periodLength}
            onChange={(e) => setFormData({...formData, periodLength: parseInt(e.target.value)})}
            className="w-full p-4 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">When did your last period start?</label>
          <input 
            type="date" 
            value={formData.lastPeriodStart}
            onChange={(e) => setFormData({...formData, lastPeriodStart: e.target.value})}
            className="w-full p-4 bg-white border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-4 w-full pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-white border border-brand-200 text-brand-600 rounded-2xl font-semibold">Back</button>
        <button onClick={nextStep} className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-semibold">Next</button>
      </div>
    </div>,

    // Step 5: Notification Preferences
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-brand-900">Stay Updated</h2>
        <p className="text-brand-600 text-sm">Choose how you'd like to be reminded.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white border border-brand-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="text-brand-500" />
            <div>
              <p className="font-semibold text-brand-900">Period Reminders</p>
              <p className="text-xs text-brand-600">Get alerts before your period starts</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={formData.notificationsEnabled}
            onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
            className="w-6 h-6 accent-brand-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-brand-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-500" />
            <div>
              <p className="font-semibold text-brand-900">Pad Access Alerts</p>
              <p className="text-xs text-brand-600">Notify me about free pad distributions</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={formData.padReminders}
            onChange={(e) => setFormData({...formData, padReminders: e.target.checked})}
            className="w-6 h-6 accent-brand-600"
          />
        </div>
      </div>

      <div className="flex gap-4 w-full pt-4">
        <button onClick={prevStep} className="flex-1 py-4 bg-white border border-brand-200 text-brand-600 rounded-2xl font-semibold">Back</button>
        <button 
          onClick={handleFinish} 
          disabled={loading}
          className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-semibold disabled:opacity-50 shadow-lg shadow-brand-200"
        >
          {loading ? 'Saving...' : 'Finish'}
        </button>
      </div>
      {!formData.isLogin && (
        <button 
          onClick={handleGuestMode}
          className="w-full py-2 text-brand-400 text-xs font-bold hover:text-brand-600 transition-colors"
        >
          Continue as Guest (No Account)
        </button>
      )}
    </div>
  ];

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-100">
          <motion.div 
            className="h-full bg-brand-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
};

export default Onboarding;
