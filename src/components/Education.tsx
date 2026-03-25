import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Heart, 
  Droplets, 
  ShieldCheck, 
  Sparkles,
  PlayCircle,
  AlertCircle
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'Basics' | 'Hygiene' | 'Health' | 'Myths';
  readTime: string;
  image: string;
  content: string;
  icon: React.ReactNode;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'What is a period?',
    category: 'Basics',
    readTime: '2 min',
    image: 'https://picsum.photos/seed/period-basics/400/200',
    icon: <Droplets className="text-pink-500" />,
    content: 'A period is the monthly shedding of the lining of the uterus. It is a normal biological process that signifies the body is healthy and functioning correctly.'
  },
  {
    id: '2',
    title: 'What is normal?',
    category: 'Basics',
    readTime: '3 min',
    image: 'https://picsum.photos/seed/normal-period/400/200',
    icon: <Sparkles className="text-brand-500" />,
    content: 'Periods can vary from person to person. Flow, colour, cycle length, and symptoms may differ. A typical period may last around 5 to 7 days, but every body is unique.'
  },
  {
    id: '3',
    title: 'Common symptoms',
    category: 'Health',
    readTime: '3 min',
    image: 'https://picsum.photos/seed/symptoms/400/200',
    icon: <Heart className="text-red-500" />,
    content: 'Cramping, bloating, tiredness, headaches, sore breasts, and mood changes can happen before or during a period. These are often called PMS (Pre-Menstrual Syndrome).'
  },
  {
    id: '4',
    title: 'Hygiene tips',
    category: 'Hygiene',
    readTime: '4 min',
    image: 'https://picsum.photos/seed/hygiene-tips/400/200',
    icon: <ShieldCheck className="text-blue-500" />,
    content: 'Change pads regularly (every 4-6 hours). Wash your hands before and after changing a pad. Use clean water and soap when possible. Dispose of used pads safely by wrapping them and placing them in a bin.'
  },
  {
    id: '5',
    title: 'When to seek help',
    category: 'Health',
    readTime: '3 min',
    image: 'https://picsum.photos/seed/seek-help/400/200',
    icon: <AlertCircle className="text-orange-500" />,
    content: 'Seek medical help if bleeding is extremely heavy (soaking through a pad in an hour), pain is severe, periods stop for a long time unexpectedly, or symptoms interfere with daily life.'
  },
  {
    id: '6',
    title: 'Why menstrual health matters',
    category: 'Basics',
    readTime: '4 min',
    image: 'https://picsum.photos/seed/equity/400/200',
    icon: <BookOpen className="text-emerald-500" />,
    content: 'Access to menstrual products, private toilets, water, and menstrual health education helps girls stay healthy, safe, and in school. It is a fundamental right.'
  }
];

const Education: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {selectedArticle ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-brand-100"
        >
          <img 
            src={selectedArticle.image} 
            alt={selectedArticle.title} 
            className="w-full h-48 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase rounded-full">
                {selectedArticle.category}
              </span>
              <span className="text-brand-400 text-[10px] font-bold uppercase">
                {selectedArticle.readTime} read
              </span>
            </div>
            <h2 className="text-2xl font-bold text-brand-900 mb-6">{selectedArticle.title}</h2>
            <div className="prose prose-brand max-w-none text-brand-700 leading-relaxed space-y-4">
              <p>{selectedArticle.content}</p>
              <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 mt-6">
                <p className="text-xs font-bold text-brand-900 flex items-center gap-2">
                  <Heart size={14} fill="currentColor" className="text-brand-500" />
                  Remember
                </p>
                <p className="text-xs text-brand-700 mt-1">
                  Periods should not be a source of shame. It is a normal part of life, and asking for help is always okay.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedArticle(null)}
              className="mt-8 w-full py-4 bg-brand-50 text-brand-600 rounded-2xl font-bold hover:bg-brand-100 transition-colors"
            >
              Back to Library
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search articles, tips, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>

          {/* Featured Video Placeholder */}
          <div className="bg-brand-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-brand-900/20">
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block border border-white/10">
                Featured Video
              </span>
              <h3 className="text-2xl font-bold mb-2 leading-tight">Cycle Tracking 101</h3>
              <p className="text-brand-100/70 text-sm mb-8 max-w-[220px] leading-relaxed">
                Master the art of tracking your cycle with our comprehensive video guide.
              </p>
              <div className="flex items-center gap-3 font-bold text-sm bg-white text-brand-900 w-fit px-6 py-3 rounded-2xl shadow-lg group-hover:bg-brand-50 transition-colors">
                <PlayCircle size={20} fill="currentColor" className="text-brand-600" /> Watch Now
              </div>
            </div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-500/30 to-transparent" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-brand-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-brand-400/10 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {['All', 'Basics', 'Hygiene', 'Health', 'Myths'].map(cat => (
              <button 
                key={cat}
                className={`px-8 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm
                  ${(searchQuery === cat || (cat === 'All' && !searchQuery)) 
                    ? 'bg-brand-600 text-white border-brand-600 shadow-brand-200' 
                    : 'bg-white text-brand-500 border-brand-100 hover:border-brand-300'}`}
                onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Article List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-brand-900">Learning Library</h3>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{filteredArticles.length} Articles</span>
            </div>
            {filteredArticles.map(article => (
              <motion.div 
                key={article.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-white p-5 rounded-[2rem] shadow-sm border border-brand-100 flex items-center gap-5 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  {React.cloneElement(article.icon as React.ReactElement, { size: 28 })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-1">
                    {article.category} • {article.readTime}
                  </p>
                  <h4 className="font-bold text-brand-900 group-hover:text-brand-600 transition-colors truncate">{article.title}</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-300 group-hover:bg-brand-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Education;
