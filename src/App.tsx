import { useState, useEffect } from 'react';
import React from 'react';
import { onAuthStateChanged, User, signOut, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, getDocFromServer, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Onboarding from './components/Onboarding';
import SplashScreen from './components/SplashScreen';
import Calendar from './components/Calendar';
import PadLocator from './components/Map';
import Education from './components/Education';
import Community from './components/Community';
import Partners from './components/Partners';
import Donate from './components/Donate';
import PartnerIntro from './components/PartnerIntro';
import RequestPad from './components/RequestPad';
import PartnerImpact from './components/PartnerImpact';
import ShareStory from './components/ShareStory';
import ErrorBoundary from './components/ErrorBoundary';
import { handleFirestoreError, OperationType } from './utils/errorHandlers';
import { seedDatabase } from './utils/seedData';
import { PARTNER_FORM_URL } from './constants/config';
import { DAILY_TIPS } from './constants/tips';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MapPin, 
  BookOpen, 
  User as UserIcon,
  Plus,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
  Users,
  Building2,
  Heart
} from 'lucide-react';
import { format, addDays, parseISO, differenceInDays, isBefore } from 'date-fns';

type View = 'home' | 'calendar' | 'map' | 'education' | 'community' | 'partners' | 'donate' | 'partner-intro' | 'profile' | 'request-pad' | 'partner-impact' | 'share-story';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [viewHistory, setViewHistory] = useState<View[]>(['home']);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigateTo = (view: View, data?: any) => {
    if (view === 'request-pad') setSelectedLocation(data);
    if (view === 'partner-impact') setSelectedPartner(data);
    if (view === currentView) return;
    setCurrentView(view);
    setViewHistory(prev => [...prev, view]);
  };

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // remove current
      const prevView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setCurrentView(prevView);
    } else {
      setCurrentView('home');
      setViewHistory(['home']);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const checkLocalProfile = () => {
    const localProfile = localStorage.getItem('saving_pad_profile');
    if (localProfile) {
      const data = JSON.parse(localProfile);
      setUserProfile(data);
      setShowOnboarding(false);
      setLoading(false);
      
      // If guest but not signed in to Firebase, sign in anonymously
      if (data.isGuest && !auth.currentUser) {
        signInAnonymously(auth).catch(err => console.error("Auto-guest auth failed:", err));
      }
      
      return true;
    }
    return false;
  };

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        seedDatabase(); // Only admin succeeds
      } else {
        if (!checkLocalProfile()) {
          setUserProfile(null);
          setShowOnboarding(true);
        }
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Profile listener
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const userPath = `users/${user.uid}`;
    
    const unsubscribeProfile = onSnapshot(doc(db, userPath), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        localStorage.setItem('saving_pad_profile', JSON.stringify(data));
        setShowOnboarding(false);
      } else {
        if (!checkLocalProfile()) {
          setTimeout(() => {
            if (!localStorage.getItem('saving_pad_profile')) {
              setShowOnboarding(true);
            }
          }, 2000);
        }
      }
      setLoading(false);
    }, (error: any) => {
      console.error("Error fetching user doc:", error);
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, userPath);
      }
      if (!checkLocalProfile()) {
        setShowOnboarding(true);
      }
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const calculateNextPeriod = () => {
    if (!userProfile?.lastPeriodStart || userProfile.lastPeriodStart === "" || !userProfile?.cycleLength) return null;
    try {
      const lastStart = parseISO(userProfile.lastPeriodStart);
      if (isNaN(lastStart.getTime())) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let nextStart = addDays(lastStart, userProfile.cycleLength);
      
      // If the predicted date is in the past, find the next future occurrence
      while (isBefore(nextStart, today)) {
        nextStart = addDays(nextStart, userProfile.cycleLength);
      }
      
      const daysUntil = differenceInDays(nextStart, today);
      
      return {
        date: nextStart,
        daysUntil: daysUntil
      };
    } catch (e) {
      return null;
    }
  };

  const nextPeriod = calculateNextPeriod();

  // Get daily tip based on current date
  const getDailyTip = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  };

  const dailyTip = getDailyTip();

  if (showSplash || (loading && !userProfile)) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </ErrorBoundary>
    );
  }

  const updateProfile = async (newData: any) => {
    const updatedProfile = { ...userProfile, ...newData };
    setUserProfile(updatedProfile);
    
    if (userProfile?.isGuest) {
      localStorage.setItem('saving_pad_profile', JSON.stringify(updatedProfile));
    } else if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Cycle Card */}
            <div className="bg-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-200 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-brand-100 text-sm font-medium uppercase tracking-wider">Next Period In</p>
                <h2 className="text-5xl font-bold mt-2">
                  {nextPeriod ? `${nextPeriod.daysUntil} Days` : 'Not Set'}
                </h2>
                <p className="mt-4 text-brand-100 opacity-80">
                  {nextPeriod ? `Predicted: ${format(nextPeriod.date, 'MMM d')} - ${format(addDays(nextPeriod.date, (userProfile?.periodLength || 5) - 1), 'MMM d')}` : 'Log your last period to see predictions'}
                </p>
                <button 
                  onClick={() => navigateTo('calendar')}
                  className="mt-6 px-6 py-3 bg-white text-brand-600 rounded-xl font-bold text-sm"
                >
                  Log Period
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => navigateTo('calendar')}
                className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-brand-300 transition-all"
              >
                <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <p className="font-bold text-brand-900 text-[10px]">Log Cycle</p>
              </div>
              <div 
                onClick={() => navigateTo('map')}
                className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-brand-300 transition-all"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <p className="font-bold text-brand-900 text-[10px]">Find Pads</p>
              </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="text-brand-500" size={20} />
                <h3 className="font-bold text-brand-900">Daily Tip</h3>
              </div>
              <p className="text-brand-700 text-sm leading-relaxed">
                {dailyTip}
              </p>
            </div>

            {/* Partner Spotlight */}
            <div 
              onClick={() => navigateTo('partners')}
              className="bg-brand-50 p-6 rounded-3xl border border-brand-200 flex items-center justify-between cursor-pointer hover:bg-brand-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-900 text-sm">Our Partners</h3>
                  <p className="text-xs text-brand-600">See who's supporting our mission</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-400" />
            </div>

            {/* Community Spotlight */}
            <div 
              onClick={() => navigateTo('community')}
              className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-900 text-sm">Sisterhood Circle</h3>
                  <p className="text-xs text-brand-600">Join the conversation & support others</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-purple-400" />
            </div>

            {/* Share Story CTA */}
            <div 
              onClick={() => navigateTo('share-story')}
              className="bg-pink-50 p-6 rounded-3xl border border-pink-100 flex items-center justify-between cursor-pointer hover:bg-pink-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-900 text-sm">Share Your Story</h3>
                  <p className="text-xs text-brand-600">Tell us how Saving Pad helped you</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-pink-400" />
            </div>
          </div>
        );
      case 'calendar':
        return <Calendar userProfile={userProfile} />;
      case 'map':
        return <PadLocator onRequestPad={(location) => navigateTo('request-pad', location)} />;
      case 'education':
        return <Education />;
      case 'community':
        return <Community 
          onDonate={() => navigateTo('donate')} 
          onShareStory={() => navigateTo('share-story')}
        />;
      case 'share-story':
        return <ShareStory onBack={handleBack} onComplete={() => navigateTo('community')} />;
      case 'partners':
        return <Partners 
          onDonate={() => navigateTo('donate')} 
          onPartnerIntro={() => navigateTo('partner-intro')}
          onLearnMore={(partner) => navigateTo('partner-impact', partner)}
        />;
      case 'partner-intro':
        return <PartnerIntro 
          onBack={handleBack}
        />;
      case 'donate':
        return <Donate onBack={handleBack} />;
      case 'request-pad':
        return <RequestPad location={selectedLocation} onBack={handleBack} onComplete={handleBack} />;
      case 'partner-impact':
        return <PartnerImpact partner={selectedPartner} onBack={handleBack} />;
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-100 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={48} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-brand-700 transition-colors">
                    <Plus size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      defaultValue={userProfile?.displayName || user?.displayName || ''}
                      placeholder="Enter your name"
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl text-center font-bold text-brand-900 focus:ring-2 focus:ring-brand-500 outline-none"
                      onBlur={(e) => {
                        updateProfile({ displayName: e.target.value });
                        setIsEditingProfile(false);
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-bold text-brand-900">
                      {userProfile?.displayName || user?.displayName || (userProfile?.isGuest ? 'Guest User' : 'User')}
                    </h2>
                    <button onClick={() => setIsEditingProfile(true)} className="text-brand-400 hover:text-brand-600">
                      <Settings size={16} />
                    </button>
                  </div>
                )}
                <p className="text-brand-500 text-sm mt-1">{user?.email || 'Local Profile'}</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
            </div>

            {isEditingCycle && (
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-500 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-brand-900">Edit Cycle Settings</h3>
                  <button onClick={() => setIsEditingCycle(false)} className="text-brand-400">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-400 uppercase mb-1">Cycle Length</label>
                    <input 
                      type="number" 
                      value={userProfile?.cycleLength || 28}
                      onChange={(e) => updateProfile({ cycleLength: parseInt(e.target.value) })}
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl font-bold text-brand-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-400 uppercase mb-1">Period Length</label>
                    <input 
                      type="number" 
                      value={userProfile?.periodLength || 5}
                      onChange={(e) => updateProfile({ periodLength: parseInt(e.target.value) })}
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl font-bold text-brand-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-400 uppercase mb-1">Last Period Start</label>
                  <input 
                    type="date" 
                    value={userProfile?.lastPeriodStart || ''}
                    onChange={(e) => updateProfile({ lastPeriodStart: e.target.value })}
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl font-bold text-brand-900"
                  />
                </div>
                <button 
                  onClick={() => setIsEditingCycle(false)}
                  className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-sm"
                >
                  Save Changes
                </button>
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-brand-100 overflow-hidden">
              <div className="p-4 border-b border-brand-50">
                <h3 className="font-bold text-brand-900 px-2">Settings</h3>
              </div>
              <div className="divide-y divide-brand-50">
                <button 
                  onClick={() => setIsEditingCycle(!isEditingCycle)}
                  className={`w-full p-6 flex items-center justify-between hover:bg-brand-50 transition-colors ${isEditingCycle ? 'bg-brand-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                      <Settings size={20} />
                    </div>
                    <span className="font-semibold text-brand-900">Cycle Settings</span>
                  </div>
                  <ChevronRight size={20} className={`text-brand-300 transition-transform ${isEditingCycle ? 'rotate-90' : ''}`} />
                </button>
                <button 
                  onClick={() => navigateTo('partners')}
                  className="w-full p-6 flex items-center justify-between hover:bg-brand-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    <span className="font-semibold text-brand-900">Our Partners</span>
                  </div>
                  <ChevronRight size={20} className="text-brand-300" />
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut size={20} />
                    </div>
                    <span className="font-semibold text-red-600">Log Out</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-100 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-brand-50 pb-24 shadow-2xl relative overflow-x-hidden">
          {/* Header */}
          <header className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {currentView !== 'home' && (
                <button 
                  onClick={handleBack}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-brand-900">
                  {currentView === 'home' ? 'Hello!' : 
                   currentView === 'request-pad' ? 'Request Pad' :
                   currentView.charAt(0).toUpperCase() + currentView.slice(1).replace('-', ' ')}
                </h1>
                <p className="text-brand-600 text-sm">
                  {currentView === 'home' ? 'Welcome back to Saving Pad' : 
                   currentView === 'request-pad' ? 'Get support discreetly' :
                   `Manage your ${currentView.replace('-', ' ')}`}
                </p>
              </div>
            </div>
            {currentView !== 'profile' && (
              <button 
                onClick={() => navigateTo('profile')}
                className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <UserIcon size={24} />
              </button>
            )}
          </header>

          {/* Main Content */}
          <main className="px-6">
            {renderView()}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-brand-100 px-4 py-4 flex justify-between items-center z-50">
            <button 
              onClick={() => navigateTo('home')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' ? 'text-brand-600' : 'text-brand-400'}`}
            >
              <Home size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Home</span>
            </button>
            <button 
              onClick={() => navigateTo('calendar')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'calendar' ? 'text-brand-600' : 'text-brand-400'}`}
            >
              <CalendarIcon size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Cycle</span>
            </button>
            <button 
              onClick={() => navigateTo('map')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'map' ? 'text-brand-600' : 'text-brand-400'}`}
            >
              <MapPin size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Pads</span>
            </button>
            <button 
              onClick={() => navigateTo('education')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'education' ? 'text-brand-600' : 'text-brand-400'}`}
            >
              <BookOpen size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Learn</span>
            </button>
            <button 
              onClick={() => navigateTo('profile')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'profile' ? 'text-brand-600' : 'text-brand-400'}`}
            >
              <UserIcon size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Me</span>
            </button>
          </nav>

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
              <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <LogOut size={32} />
                </div>
                <h3 className="text-xl font-bold text-brand-900 text-center mb-2">Log Out?</h3>
                <p className="text-brand-600 text-center text-sm mb-8">Are you sure you want to log out of Saving Pad?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-4 bg-brand-50 text-brand-600 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-colors"
                  >
                    No, Stay
                  </button>
                  <button 
                    onClick={async () => {
                      localStorage.removeItem('saving_pad_profile');
                      await signOut(auth);
                      window.location.reload();
                    }}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                  >
                    Yes, Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

