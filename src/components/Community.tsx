import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Award, 
  Plus, 
  ChevronRight,
  HandHeart,
  Share2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

interface Group {
  id: string;
  title: string;
  members: string;
  iconType: string;
}

interface Story {
  id: string;
  content: string;
  author: string;
  image: string;
  createdAt?: any;
}

interface CommunityProps {
  onDonate: () => void;
  onShareStory: () => void;
}

const Community: React.FC<CommunityProps> = ({ onDonate, onShareStory }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const groupsQuery = query(collection(db, 'community_groups'));
    const storiesQuery = query(collection(db, 'success_stories'), orderBy('createdAt', 'desc'));

    const MOCK_GROUPS: Group[] = [
      { id: 'mock-1', title: 'Managing PCOS Symptoms', members: '1.2k', iconType: 'heart' },
      { id: 'mock-2', title: 'First Period Stories', members: '850', iconType: 'message' },
      { id: 'mock-3', title: 'Sustainable Period Products', members: '2.4k', iconType: 'award' }
    ];

    const MOCK_STORIES: Story[] = [
      { 
        id: 'mock-story-1', 
        content: "Thanks to the community support, I was able to access free pads during my exams and focus on my studies without worry.",
        author: "Amina, 17",
        image: "https://picsum.photos/seed/story/100/100"
      }
    ];

    const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      
      // Merge with mock groups, avoiding duplicates by title
      const combinedGroups = [...groupsData];
      MOCK_GROUPS.forEach(mock => {
        if (!groupsData.find(g => g.title === mock.title)) {
          combinedGroups.push(mock);
        }
      });
      
      setGroups(combinedGroups);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'community_groups');
    });

    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      
      // Merge with mock stories, avoiding duplicates by content
      // New stories from Firestore come first (ordered by createdAt desc)
      const combinedStories = [...storiesData];
      MOCK_STORIES.forEach(mock => {
        if (!storiesData.find(s => s.content === mock.content)) {
          combinedStories.push(mock);
        }
      });

      setStories(combinedStories);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'success_stories');
    });

    return () => {
      unsubscribeGroups();
      unsubscribeStories();
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart size={20} className="text-pink-500" />;
      case 'message': return <MessageCircle size={20} className="text-blue-500" />;
      case 'award': return <Award size={20} className="text-emerald-500" />;
      default: return <Users size={20} className="text-brand-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-brand-500 font-medium text-sm">Loading community impact...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-brand-600 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold">Sisterhood Circle</h2>
            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-bold text-white uppercase tracking-wider border border-white/10">
              Coming Soon
            </span>
          </div>
          <p className="text-brand-100 text-sm opacity-90 max-w-[250px]">
            Connect, share, and support each other in a safe space.
          </p>
          <div className="flex -space-x-3 mt-6">
            {[1, 2, 3, 4].map(i => (
              <img 
                key={i}
                src={`https://picsum.photos/seed/user${i}/100/100`}
                className="w-10 h-10 rounded-full border-2 border-brand-600"
                alt="User"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-brand-400 border-2 border-brand-600 flex items-center justify-center text-[10px] font-bold">
              +2k
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
        <HandHeart className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 text-center">
          <p className="text-brand-400 text-[10px] font-bold uppercase mb-1">Donated</p>
          <p className="text-lg font-bold text-brand-900">1.2k</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 text-center">
          <p className="text-brand-400 text-[10px] font-bold uppercase mb-1">Mentors</p>
          <p className="text-lg font-bold text-brand-900">85</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 text-center">
          <p className="text-brand-400 text-[10px] font-bold uppercase mb-1">Stories</p>
          <p className="text-lg font-bold text-brand-900">340</p>
        </div>
      </div>

      {/* Discussion Groups */}
      <div className="space-y-4 relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 rounded-[2.5rem] flex items-center justify-center">
          <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-xl border border-brand-100 flex items-center gap-2">
            <Users size={18} className="text-brand-500" />
            <span className="text-sm font-bold text-brand-900">Discussions Coming Soon</span>
          </div>
        </div>
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-brand-900">Active Discussions</h3>
          <button className="text-brand-600 text-xs font-bold flex items-center gap-1 bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors">
            View All <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {groups.map((group) => (
            <motion.div 
              key={group.id}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-brand-100 flex items-center justify-between cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  {getIcon(group.iconType)}
                </div>
                <div>
                  <h4 className="font-bold text-brand-900 text-sm">{group.title}</h4>
                  <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mt-0.5">{group.members} members active</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Plus size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Community Impact */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-brand-900">Community Impact</h3>
          <button 
            onClick={onShareStory}
            className="text-brand-600 text-xs font-bold flex items-center gap-1 bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <Plus size={14} /> Share Story
          </button>
        </div>
        {stories.map(story => (
          <div key={story.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-brand-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-brand-900 text-sm">Impact Story</h3>
              </div>
              <div className="flex gap-5 items-start">
                <div className="relative shrink-0">
                  <img 
                    src={story.image} 
                    className="w-20 h-20 rounded-3xl object-cover border-2 border-white shadow-md"
                    alt="Success story"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={12} fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-700 leading-relaxed italic mb-4 text-pretty">
                    "{story.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-brand-900">— {story.author}</p>
                    <div className="flex gap-2">
                      <button className="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={onDonate}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-100 hover:bg-brand-700 transition-colors"
                >
                  <HandHeart size={18} /> Support Similar Stories
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
