import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  differenceInDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Info, Check, X, Droplets, Sparkles, Zap, Heart } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface CalendarProps {
  userProfile: any;
}

const SYMPTOMS = [
  { id: 'bloating', label: 'Bloating', category: 'physical', icon: '🎈' },
  { id: 'acne', label: 'Acne', category: 'physical', icon: '✨' },
  { id: 'breast', label: 'Breast Tenderness', category: 'physical', icon: '☁️' },
  { id: 'cramps', label: 'Cramps', category: 'physical', icon: '⚡' },
  { id: 'back', label: 'Back Pain', category: 'physical', icon: '🦴' },
  { id: 'headache', label: 'Headache', category: 'physical', icon: '🤕' },
  { id: 'mood_swings', label: 'Mood Swings', category: 'emotional', icon: '🎭' },
  { id: 'anxiety', label: 'Anxiety', category: 'emotional', icon: '😟' },
  { id: 'irritability', label: 'Irritability', category: 'emotional', icon: '💢' },
  { id: 'sadness', label: 'Sadness', category: 'emotional', icon: '😢' },
  { id: 'fatigue', label: 'Fatigue', category: 'energy', icon: '😴' },
  { id: 'energy', label: 'Energy Boost', category: 'energy', icon: '⚡' },
  { id: 'libido', label: 'High Libido', category: 'energy', icon: '🔥' },
  { id: 'insomnia', label: 'Insomnia', category: 'energy', icon: '🌙' },
];

const MOODS = [
  { id: 'happy', label: 'Happy', icon: '😊' },
  { id: 'calm', label: 'Calm', icon: '😌' },
  { id: 'tired', label: 'Tired', icon: '😴' },
  { id: 'sad', label: 'Sad', icon: '😢' },
  { id: 'angry', label: 'Angry', icon: '😠' },
];

const Calendar: React.FC<CalendarProps> = ({ userProfile }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const logsPath = `users/${auth.currentUser.uid}/logs`;
    const q = query(collection(db, logsPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, logsPath);
    });

    return () => unsubscribe();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 mb-6">
        <h2 className="text-xl font-bold text-brand-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-brand-100 rounded-full text-brand-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-brand-100 rounded-full text-brand-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold uppercase tracking-widest text-brand-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const rows = [];
    let days = [];

    calendarDays.forEach((day, i) => {
      const formattedDate = format(day, 'd');
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      // Check if this day is part of a logged period
      const isLoggedPeriod = logs.some(log => {
        if (log.type !== 'period' || !log.startDate || log.startDate === "") return false;
        try {
          const start = parseISO(log.startDate);
          if (isNaN(start.getTime())) return false;
          const end = log.endDate ? parseISO(log.endDate) : addDays(start, (userProfile?.periodLength || 5) - 1);
          if (isNaN(end.getTime())) return false;
          return isWithinInterval(day, { start, end });
        } catch (e) {
          return false;
        }
      });

      // Improved prediction logic
      let isPredicted = false;
      if (userProfile?.lastPeriodStart && userProfile?.lastPeriodStart !== "" && userProfile?.cycleLength) {
        try {
          const lastStart = parseISO(userProfile.lastPeriodStart);
          if (!isNaN(lastStart.getTime())) {
            const cycleLen = userProfile.cycleLength;
            const periodLen = userProfile.periodLength || 5;
            
            // Calculate how many cycles have passed since lastStart to the current day
            const diffDays = differenceInDays(day, lastStart);
            if (diffDays >= 0) {
              const cyclesPassed = Math.floor(diffDays / cycleLen);
              const predStart = addDays(lastStart, cyclesPassed * cycleLen);
              const predEnd = addDays(predStart, periodLen - 1);
              
              if (isWithinInterval(day, { start: predStart, end: predEnd })) {
                isPredicted = true;
              }
              
              // Also check the next cycle in case the current day is at the very beginning of it
              const nextPredStart = addDays(lastStart, (cyclesPassed + 1) * cycleLen);
              const nextPredEnd = addDays(nextPredStart, periodLen - 1);
              if (isWithinInterval(day, { start: nextPredStart, end: nextPredEnd })) {
                isPredicted = true;
              }
            }
          }
        } catch (e) {
          // Ignore prediction errors
        }
      }

      // Check if this day has symptoms or mood logged
      const dayLog = logs.find(l => l.startDate === format(day, 'yyyy-MM-dd'));
      const hasSymptoms = dayLog?.symptoms?.length > 0;
      const hasMood = !!dayLog?.mood;

      days.push(
        <div
          key={day.toString()}
          className={`relative h-14 flex items-center justify-center cursor-pointer transition-all group
            ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
            ${isSelected ? 'z-10' : ''}
          `}
          onClick={() => setSelectedDate(day)}
        >
          {/* Selection Highlight */}
          {isSelected && (
            <div className="absolute inset-1.5 border-2 border-brand-600 rounded-2xl shadow-sm" />
          )}
          
          {/* Period Backgrounds */}
          {isLoggedPeriod && (
            <div className={`absolute inset-1 bg-pink-100 rounded-xl ${isToday ? 'ring-2 ring-pink-500 ring-offset-1' : ''}`} />
          )}
          {isPredicted && !isLoggedPeriod && (
            <div className="absolute inset-1 bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-xl" />
          )}

          <div className="relative flex flex-col items-center gap-1">
            <span className={`text-sm font-bold ${
              isToday ? 'text-brand-600' : 
              isLoggedPeriod ? 'text-pink-700' : 
              isPredicted ? 'text-pink-400' : 
              'text-brand-800'
            }`}>
              {formattedDate}
            </span>
            
            {/* Indicators Container */}
            <div className="flex gap-1 h-1">
              {hasSymptoms && (
                <div className="w-1 h-1 bg-purple-500 rounded-full shadow-sm" />
              )}
              {hasMood && (
                <div className="w-1 h-1 bg-amber-400 rounded-full shadow-sm" />
              )}
              {isLoggedPeriod && (
                <div className="w-1 h-1 bg-pink-500 rounded-full shadow-sm" />
              )}
            </div>
          </div>

          {isToday && !isLoggedPeriod && !isPredicted && (
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          )}
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="bg-white rounded-3xl p-2 shadow-sm border border-brand-100">{rows}</div>;
  };

  const handleLogPeriod = async () => {
    if (!auth.currentUser) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const logsPath = `users/${auth.currentUser.uid}/logs`;
    const existingLog = logs.find(l => l.startDate === dateStr);

    try {
      if (existingLog) {
        const logRef = doc(db, logsPath, existingLog.id);
        await updateDoc(logRef, {
          type: existingLog.type === 'period' ? 'daily' : 'period'
        });
      } else {
        await addDoc(collection(db, logsPath), {
          uid: auth.currentUser.uid,
          startDate: dateStr,
          type: 'period',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logsPath);
    }
  };

  const toggleSymptom = async (symptomId: string) => {
    if (!auth.currentUser) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const logsPath = `users/${auth.currentUser.uid}/logs`;
    const existingLog = logs.find(l => l.startDate === dateStr);

    try {
      if (existingLog) {
        const logRef = doc(db, logsPath, existingLog.id);
        const currentSymptoms = existingLog.symptoms || [];
        const newSymptoms = currentSymptoms.includes(symptomId)
          ? currentSymptoms.filter((s: string) => s !== symptomId)
          : [...currentSymptoms, symptomId];
        
        await updateDoc(logRef, { symptoms: newSymptoms });
      } else {
        await addDoc(collection(db, logsPath), {
          uid: auth.currentUser.uid,
          startDate: dateStr,
          symptoms: [symptomId],
          type: 'daily',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logsPath);
    }
  };

  const setMood = async (moodId: string) => {
    if (!auth.currentUser) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const logsPath = `users/${auth.currentUser.uid}/logs`;
    const existingLog = logs.find(l => l.startDate === dateStr);

    try {
      if (existingLog) {
        const logRef = doc(db, logsPath, existingLog.id);
        await updateDoc(logRef, { mood: moodId });
      } else {
        await addDoc(collection(db, logsPath), {
          uid: auth.currentUser.uid,
          startDate: dateStr,
          mood: moodId,
          type: 'daily',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, logsPath);
    }
  };

  const currentDayLog = logs.find(l => l.startDate === format(selectedDate, 'yyyy-MM-dd'));
  const currentSymptoms = currentDayLog?.symptoms || [];
  const currentMood = currentDayLog?.mood;

  // Month summary logs
  const monthLogs = logs.filter(l => isSameMonth(parseISO(l.startDate), currentMonth))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-3 bg-brand-50/50 rounded-2xl border border-brand-100 text-[10px] font-bold uppercase tracking-wider text-brand-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-100 rounded-md border border-pink-200" />
          <span>Logged Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-md" />
          <span>Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
          <span>Symptoms</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span>Mood</span>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-brand-100 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-brand-900">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
            <p className="text-brand-500 text-sm font-medium">
              {currentDayLog?.type === 'period' ? 'Period Logged' : 'Daily Log'}
            </p>
          </div>
          <button 
            onClick={handleLogPeriod}
            className={`p-4 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm ${
              currentDayLog?.type === 'period' 
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' 
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}
          >
            <Droplets size={20} fill={currentDayLog?.type === 'period' ? 'currentColor' : 'none'} />
            {currentDayLog?.type === 'period' ? 'Period Logged' : 'Log Period'}
          </button>
        </div>
        
        {/* Mood Tracker */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={16} className="text-purple-500" />
            <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">How are you feeling?</h4>
          </div>
          <div className="flex justify-between gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setMood(mood.id)}
                className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                  currentMood === mood.id 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100' 
                    : 'bg-white text-brand-500 border-brand-100 hover:border-brand-300'
                }`}
              >
                <span className="text-xl">{mood.icon}</span>
                <span className="text-[8px] font-bold uppercase">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Symptom Categories */}
        <div className="space-y-6">
          {[
            { id: 'physical', label: 'Physical Symptoms', icon: <Droplets size={16} className="text-pink-500" /> },
            { id: 'emotional', label: 'Emotional', icon: <Heart size={16} className="text-red-500" /> },
            { id: 'energy', label: 'Energy & Sleep', icon: <Zap size={16} className="text-emerald-500" /> }
          ].map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                {category.icon}
                <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">{category.label}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.filter(s => s.category === category.id).map(symptom => {
                  const isActive = currentSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isActive 
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                          : 'bg-white text-brand-500 border-brand-100 hover:border-brand-300'
                      }`}
                    >
                      <span>{symptom.icon}</span>
                      {symptom.label}
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-brand-50">
          <div className="flex items-center gap-3 p-4 bg-brand-50/50 rounded-2xl border border-brand-100/50">
            <Info size={16} className="text-brand-400" />
            <p className="text-[10px] text-brand-700 font-medium leading-relaxed">
              Tracking symptoms daily helps identify patterns in your cycle and provides insights for your healthcare provider.
            </p>
          </div>
        </div>
      </div>
      {/* Month Summary */}
      {monthLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-brand-900 px-1">Month Summary</h3>
          <div className="space-y-3">
            {monthLogs.map(log => (
              <div 
                key={log.id}
                onClick={() => setSelectedDate(parseISO(log.startDate))}
                className="bg-white p-4 rounded-3xl border border-brand-100 flex items-center justify-between cursor-pointer hover:border-brand-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    log.type === 'period' ? 'bg-pink-50 text-pink-500' : 'bg-brand-50 text-brand-500'
                  }`}>
                    {format(parseISO(log.startDate), 'd')}
                  </div>
                  <div>
                    <p className="font-bold text-brand-900 text-sm">{format(parseISO(log.startDate), 'EEEE, MMM d')}</p>
                    <div className="flex gap-1 mt-1">
                      {log.mood && (
                        <span className="text-xs">{MOODS.find(m => m.id === log.mood)?.icon}</span>
                      )}
                      {log.symptoms?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs">{SYMPTOMS.find(sym => sym.id === s)?.icon}</span>
                      ))}
                      {log.symptoms?.length > 3 && <span className="text-[8px] text-brand-400 font-bold">+{log.symptoms.length - 3}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-brand-300" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
