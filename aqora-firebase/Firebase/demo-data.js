// Demo data for testing without Firebase
export const DEMO_MODE = true;

export const demoUsers = {
  'demo@aqora.com': {
    uid: 'demo-user-1',
    email: 'demo@aqora.com',
    password: 'demo123',
    displayName: 'Demo Creator',
    username: 'democreator',
    bio: 'Building amazing things on AQORA 🚀',
    profession: 'Product Designer',
    interests: ['design', 'technology', 'creativity'],
    followers: 1250,
    following: 342,
    avatar: 'DC',
    completedOnboarding: true
  },
  'test@aqora.com': {
    uid: 'demo-user-2',
    email: 'test@aqora.com',
    password: 'test123',
    displayName: 'Alex Johnson',
    username: 'alexjohnson',
    bio: 'Content Creator | Photographer | Explorer',
    profession: 'Content Creator',
    interests: ['photography', 'travel', 'lifestyle'],
    followers: 5420,
    following: 234,
    avatar: 'AJ',
    completedOnboarding: true
  }
};

export const demoPosts = [
  {
    id: '1',
    author: 'democreator',
    authorName: 'Demo Creator',
    authorAvatar: 'DC',
    content: 'Just launched my new project on AQORA! Excited to share my creative journey with this amazing community 🚀',
    likes: 342,
    comments: 45,
    shares: 12,
    timestamp: Date.now() - 3600000,
    tags: ['#design', '#aqora', '#creative']
  },
  {
    id: '2',
    author: 'alexjohnson',
    authorName: 'Alex Johnson',
    authorAvatar: 'AJ',
    content: 'The best part about AQORA is the supportive community. Everyone is so inspiring! 💪',
    likes: 1205,
    comments: 128,
    shares: 87,
    timestamp: Date.now() - 7200000,
    tags: ['#community', '#aqora', '#inspiration']
  },
  {
    id: '3',
    author: 'democreator',
    authorName: 'Demo Creator',
    authorAvatar: 'DC',
    content: 'Working on a new design system. First thoughts? Your feedback helps me grow! 🎨',
    likes: 567,
    comments: 89,
    shares: 34,
    timestamp: Date.now() - 10800000,
    tags: ['#design', '#ui', '#feedback']
  }
];

export const demoReels = [
  {
    id: '1',
    author: 'democreator',
    authorName: 'Demo Creator',
    description: 'Design process time-lapse 🎨✨',
    video: 'https://via.placeholder.com/400x800?text=Reel+1',
    likes: 2340,
    comments: 234,
    shares: 456,
    saves: 789
  },
  {
    id: '2',
    author: 'alexjohnson',
    authorName: 'Alex Johnson',
    description: 'Behind the scenes of my latest shoot 📸',
    video: 'https://via.placeholder.com/400x800?text=Reel+2',
    likes: 5678,
    comments: 567,
    shares: 890,
    saves: 1234
  },
  {
    id: '3',
    author: 'democreator',
    authorName: 'Demo Creator',
    description: 'Quick tip: Color theory for beginners 🎯',
    video: 'https://via.placeholder.com/400x800?text=Reel+3',
    likes: 1234,
    comments: 123,
    shares: 234,
    saves: 567
  }
];

export const demoStories = [
  {
    id: '1',
    author: 'democreator',
    authorName: 'Demo Creator',
    avatar: 'DC',
    content: 'Working late on new projects 🌙',
    timestamp: Date.now() - 3600000
  },
  {
    id: '2',
    author: 'alexjohnson',
    authorName: 'Alex Johnson',
    avatar: 'AJ',
    content: 'Amazing sunset today! 🌅',
    timestamp: Date.now() - 7200000
  }
];

export const demoCommunities = [
  {
    id: '1',
    name: 'Design Lovers',
    description: 'A community for designers to share and learn',
    members: 5234,
    avatar: '🎨',
    featured: true
  },
  {
    id: '2',
    name: 'Tech Innovators',
    description: 'Discussing the latest in technology and innovation',
    members: 8901,
    avatar: '💻',
    featured: true
  },
  {
    id: '3',
    name: 'Creative Minds',
    description: 'Unleash your creativity with like-minded creators',
    members: 3456,
    avatar: '🚀',
    featured: true
  }
];

export const demoNotifications = [
  {
    id: '1',
    type: 'like',
    message: 'Alex Johnson liked your post',
    timestamp: Date.now() - 1800000,
    read: false
  },
  {
    id: '2',
    type: 'follow',
    message: 'Sarah Williams started following you',
    timestamp: Date.now() - 3600000,
    read: false
  },
  {
    id: '3',
    type: 'comment',
    message: 'Mike Johnson commented on your reel',
    timestamp: Date.now() - 7200000,
    read: true
  }
];

export const demoMessages = [
  {
    id: '1',
    participantName: 'Alex Johnson',
    participantAvatar: 'AJ',
    lastMessage: 'That design looks amazing! 🔥',
    timestamp: Date.now() - 3600000,
    unread: 2,
    messages: [
      { sender: 'alexjohnson', text: 'Hey! How are you?', timestamp: Date.now() - 7200000 },
      { sender: 'demo', text: 'Doing great! Just finished a new project', timestamp: Date.now() - 5400000 },
      { sender: 'alexjohnson', text: 'That design looks amazing! 🔥', timestamp: Date.now() - 3600000 }
    ]
  },
  {
    id: '2',
    participantName: 'Design Community',
    participantAvatar: '🎨',
    lastMessage: 'Sarah shared a design inspiration',
    timestamp: Date.now() - 10800000,
    unread: 0,
    messages: [
      { sender: 'sarah', text: 'Check out this amazing design!', timestamp: Date.now() - 10800000 }
    ]
  }
];

export const demoTrends = [
  '#Design',
  '#Technology',
  '#Creators',
  '#Innovation',
  '#Community',
  '#Creative',
  '#AQORA',
  '#Inspiration'
];
