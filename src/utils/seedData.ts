import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, query, limit, deleteDoc } from 'firebase/firestore';

const MOCK_LOCATIONS = [
  {
    id: 'fct-special-needs',
    name: 'FCT School for Children with Special Needs',
    address: 'GGSSS Road, Paseli, Kuje, Abuja',
    type: 'School',
    lat: 8.8786,
    lng: 7.2276,
    phone: '08051070352 (Mrs. Musili Yusuf Ayinla)',
    hours: 'Day & Boarding',
    description: 'Government-owned primary school specializing in support for intellectually challenged children. Located along GGSSS Road.'
  },
  {
    id: 'school-deaf',
    name: 'FCT School for the Deaf',
    address: 'Kuje-Gwagwalada Road, Paseli, Kuje, Abuja',
    type: 'School',
    lat: 8.8850,
    lng: 7.2350,
    phone: '08055270565 (Onoja John Edache) / 0803 628 6622',
    hours: 'Day & Boarding (Closes 4:00 PM)',
    description: 'Government-owned institution for students with hearing impairments.'
  },
  {
    id: 'jabbi-blind',
    name: 'FCT School for the Blind Children',
    address: '12 Asheik Jarma Street, Jabi, Abuja',
    type: 'School',
    lat: 9.0617,
    lng: 7.4244,
    phone: '+234 805 294 4449',
    hours: 'Day & Boarding',
    description: 'Government-owned school catering to students with visual impairments. Located near No. 15 Audu Ogbe Street.'
  }
];

const MOCK_GROUPS = [
  { id: '1', title: 'Managing PCOS Symptoms', members: '1.2k', iconType: 'heart' },
  { id: '2', title: 'First Period Stories', members: '850', iconType: 'message' },
  { id: '3', title: 'Sustainable Period Products', members: '2.4k', iconType: 'award' }
];

const MOCK_STORIES = [
  { 
    id: '1', 
    content: "Thanks to the community support, I was able to access free pads during my exams and focus on my studies without worry.",
    author: "Amina, 17",
    image: "https://picsum.photos/seed/story/100/100",
    uid: 'system',
    createdAt: new Date('2024-01-01')
  }
];

const MOCK_PARTNERS = [
  {
    id: 'dwai',
    name: 'Deaf Women Aloud Initiative (DWAI)',
    logo: '/images/dwai-image.jpeg',
    description: 'Deaf Women Aloud Initiative (DWAI) is a disability-inclusive organization in Abuja focused on amplifying the voices of Deaf women and girls, promoting inclusion, and improving access to health information and services.',
    website: 'https://deafwomenaloudinitiative.org',
    type: 'both',
    address: 'P&D Plaza, Beside Best Buyer Supermarket, Kuje, Abuja-FCT',
    phone: '+234 803 750 0671',
    email: 'deafwomenaloudinitiative@gmail.com'
  }
];

export const seedDatabase = async () => {
  // Only attempt seeding if user is authenticated and is the designated admin
  // This matches the security rules and prevents "Missing or insufficient permissions" errors
  if (!auth.currentUser || auth.currentUser.email !== 'oguerichidinmab@gmail.com') {
    return;
  }

  try {
    // Seed Locations
    const locsSnap = await getDocs(query(collection(db, 'locations'), limit(1)));
    if (locsSnap.empty) {
      console.log('Seeding locations...');
      for (const loc of MOCK_LOCATIONS) {
        await setDoc(doc(db, 'locations', loc.id), loc);
      }
    } else {
      // Cleanup: Remove TECHBDI if it was previously seeded
      await deleteDoc(doc(db, 'locations', 'techbdi-kuje'));
    }

    // Seed Groups
    const groupsSnap = await getDocs(query(collection(db, 'community_groups'), limit(1)));
    if (groupsSnap.empty) {
      console.log('Seeding community groups...');
      for (const group of MOCK_GROUPS) {
        await setDoc(doc(db, 'community_groups', group.id), group);
      }
    }

    // Seed Stories
    const storiesSnap = await getDocs(query(collection(db, 'success_stories'), limit(1)));
    if (storiesSnap.empty) {
      console.log('Seeding success stories...');
      for (const story of MOCK_STORIES) {
        await setDoc(doc(db, 'success_stories', story.id), story);
      }
    }

    // Seed Partners
    const partnersSnap = await getDocs(query(collection(db, 'partners'), limit(1)));
    if (partnersSnap.empty) {
      console.log('Seeding partners...');
      for (const partner of MOCK_PARTNERS) {
        await setDoc(doc(db, 'partners', partner.id), partner);
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    // Log error but don't crash the app
    console.warn('Database seeding skipped or failed:', error);
  }
};
