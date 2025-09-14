'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  expertise: string[];
  followers: number;
  verified: boolean;
  rating: number;
  sessionsCompleted: number;
  bio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  available: boolean;
  nextAvailable: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  category: string;
  youtubeId: string;
  mentor: string;
}

interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
  mentor: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  level: string;
  xp: number;
}

export default function CommunityHub() {
  const [newPost, setNewPost] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'mentors' | 'buddies' | 'sessions'>('feed');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('ignite-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch Ishan Sharma's YouTube videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await fetch('/api/youtube-videos');
        const data = await response.json();
        if (data.videos) {
          setVideos(data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Load real mentors
  useEffect(() => {
    const loadMentors = async () => {
      const realMentors: Mentor[] = [
        {
          id: '1',
          name: 'Ishan Sharma',
          avatar: '/ishan-sharma.jpg',
          role: 'Startup Founder & Tech Mentor',
          company: 'Tech Innovators Inc.',
          expertise: ['Startup Strategy', 'Product Management', 'Tech Leadership', 'Career Growth'],
          followers: 12500,
          verified: true,
          rating: 4.9,
          sessionsCompleted: 342,
          bio: 'Serial entrepreneur with 8+ years building tech startups. Helping students transition from college to successful tech careers. Passionate about democratizing education!',
          socialLinks: {
            twitter: 'https://twitter.com/ishansharma',
            linkedin: 'https://linkedin.com/in/ishansharma',
            github: 'https://github.com/ishansharma',
            youtube: 'https://youtube.com/@IshanSharma7390'
          },
          available: true,
          nextAvailable: 'Today, 2:00 PM'
        },
        {
          id: '2',
          name: 'Elon Musk',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
          role: 'CEO & Entrepreneur',
          company: 'Tesla, SpaceX',
          expertise: ['Entrepreneurship', 'Innovation', 'Space Technology', 'Electric Vehicles'],
          followers: 50000000,
          verified: true,
          rating: 4.8,
          sessionsCompleted: 1500,
          bio: 'CEO of Tesla and SpaceX. Visionary entrepreneur revolutionizing transportation and space exploration. Passionate about sustainable energy and Mars colonization.',
          socialLinks: {
            twitter: 'https://twitter.com/elonmusk',
            linkedin: 'https://linkedin.com/in/elonmusk'
          },
          available: false,
          nextAvailable: 'Next Month'
        },
        {
          id: '3',
          name: 'Sundar Pichai',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          role: 'CEO',
          company: 'Google',
          expertise: ['Leadership', 'Technology Strategy', 'Product Management', 'AI/ML'],
          followers: 2500000,
          verified: true,
          rating: 4.9,
          sessionsCompleted: 800,
          bio: 'CEO of Google and Alphabet. Technology leader with deep expertise in AI, search, and cloud computing. Committed to making technology accessible to everyone.',
          socialLinks: {
            twitter: 'https://twitter.com/sundarpichai',
            linkedin: 'https://linkedin.com/in/sundarpichai'
          },
          available: true,
          nextAvailable: 'Next Week'
        },
        {
          id: '4',
          name: 'Satya Nadella',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
          role: 'CEO',
          company: 'Microsoft',
          expertise: ['Cloud Computing', 'AI Strategy', 'Digital Transformation', 'Leadership'],
          followers: 1800000,
          verified: true,
          rating: 4.8,
          sessionsCompleted: 650,
          bio: 'CEO of Microsoft. Technology visionary leading the company through digital transformation. Expert in cloud computing and AI strategy.',
          socialLinks: {
            twitter: 'https://twitter.com/satyanadella',
            linkedin: 'https://linkedin.com/in/satyanadella'
          },
          available: true,
          nextAvailable: 'Tomorrow, 3:00 PM'
        },
        {
          id: '5',
          name: 'Jensen Huang',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          role: 'CEO & Founder',
          company: 'NVIDIA',
          expertise: ['AI Hardware', 'Graphics Technology', 'Leadership', 'Innovation'],
          followers: 1200000,
          verified: true,
          rating: 4.9,
          sessionsCompleted: 420,
          bio: 'CEO and co-founder of NVIDIA. Pioneer in AI computing and graphics technology. Leading the AI revolution with cutting-edge hardware solutions.',
          socialLinks: {
            twitter: 'https://twitter.com/jensenhuang',
            linkedin: 'https://linkedin.com/in/jensenhuang'
          },
          available: true,
          nextAvailable: 'This Friday, 1:00 PM'
        },
        {
          id: '6',
          name: 'Tim Cook',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
          role: 'CEO',
          company: 'Apple',
          expertise: ['Supply Chain', 'Leadership', 'Innovation', 'Product Strategy'],
          followers: 3200000,
          verified: true,
          rating: 4.7,
          sessionsCompleted: 580,
          bio: 'CEO of Apple Inc. Technology leader focused on innovation, sustainability, and user experience. Expert in supply chain management and product strategy.',
          socialLinks: {
            twitter: 'https://twitter.com/tim_cook',
            linkedin: 'https://linkedin.com/in/timcook'
          },
          available: false,
          nextAvailable: 'Next Month'
        }
      ];
      
      setMentors(realMentors);
    };

    loadMentors();
  }, []);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: 'Just completed my AI Agents roadmap! The personalized learning path was incredible. Thanks @IshanSharma for the amazing mentorship! 🚀',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      liked: false
    },
    {
      id: '2',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: 'The community here is amazing! Found my study buddy through the AI matching system. We\'re crushing our Product Management goals together! 💪',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 12,
      liked: true
    },
    {
      id: '3',
      author: {
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        verified: false
      },
      content: 'Leveled up to Senior Developer! The gamification system made learning so engaging. Can\'t wait to start my next challenge! 🎮',
      timestamp: '6 hours ago',
      likes: 31,
      comments: 15,
      liked: false
    }
  ]);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '2:00 PM', date: 'Today', available: true, mentor: 'Ishan Sharma' },
    { id: '2', time: '4:00 PM', date: 'Today', available: true, mentor: 'Ishan Sharma' },
    { id: '3', time: '10:00 AM', date: 'Tomorrow', available: true, mentor: 'Ishan Sharma' },
    { id: '4', time: '2:00 PM', date: 'Tomorrow', available: false, mentor: 'Ishan Sharma' },
    { id: '5', time: '11:00 AM', date: 'Day After', available: true, mentor: 'Ishan Sharma' },
    { id: '6', time: '3:00 PM', date: 'Day After', available: true, mentor: 'Ishan Sharma' }
  ]);

  const categories = ['all', 'AI Agents', 'Startup Strategy', 'Career Growth', 'Tech Leadership', 'Product Management'];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  const handleCloseMentorModal = () => {
    setSelectedMentor(null);
  };

  const handleBookSession = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot.id);
    alert(`Session booked with Ishan Sharma for ${timeSlot.date} at ${timeSlot.time}! You'll receive a confirmation email shortly.`);
  };

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              NeoCampus
            </a>
              <div className="hidden md:flex space-x-8">
                <a href="/advisor" className="text-slate-300 hover:text-white transition-colors">Advisor</a>
                <a href="/community" className="text-white font-semibold">Community</a>
                <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <img 
                    src={user?.avatar} 
                    alt={user?.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{user?.name}</span>
                </div>
              ) : (
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Community Hub
                </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Connect, learn, and grow with fellow students and industry mentors. Your journey to success starts here! 🚀
          </p>
                </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'feed'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📱 Feed
              </button>
              <button
                onClick={() => setActiveTab('mentors')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'mentors'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                👨‍🏫 Mentors
              </button>
              <button
                onClick={() => setActiveTab('buddies')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'buddies'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                🤝 Study Buddies
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'sessions'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                📅 Book Sessions
              </button>
            </div>
          </div>
              </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Create Post */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-3xl p-6 backdrop-blur-sm border border-slate-600/50 shadow-2xl">
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share your learning journey with the community..."
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Share Post
                        </button>
                      </div>
              </form>
            </div>

            {/* Posts */}
            {posts.map((post, index) => (
              <div 
                key={post.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-3xl p-6 backdrop-blur-sm border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-white">{post.author.name}</h3>
                      {post.author.verified && (
                        <span className="text-blue-400 text-sm">✓</span>
                      )}
                      <span className="text-slate-400 text-sm">{post.timestamp}</span>
                    </div>
                    <p className="text-slate-200 mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <span className="text-xl">{post.liked ? '❤️' : '🤍'}</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors">
                        <span className="text-xl">💬</span>
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
                👨‍🏫 Expert Mentors
              </h1>
              <p className="text-xl text-slate-300">Learn from industry leaders and get personalized guidance!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <div 
                  key={mentor.id}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-3xl p-6 backdrop-blur-sm border border-slate-600/50 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/50"
                      />
                      {mentor.verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                      </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{mentor.name}</h3>
                      <p className="text-blue-400 text-sm">{mentor.role}</p>
                      <p className="text-slate-400 text-xs">{mentor.company}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{mentor.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>{mentor.followers.toLocaleString()} followers</span>
                    <span className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{mentor.rating}</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleBookMentor(mentor)}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                      mentor.available 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={!mentor.available}
                  >
                    {mentor.available ? '📅 Book Session' : '⏰ Not Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
                📅 Book 1-on-1 Sessions
              </h1>
              <p className="text-xl text-slate-300">Learn from Ishan Sharma through personalized mentoring sessions!</p>
              </div>
              
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-sm border border-blue-500/30 mb-8">
              <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <img
                    src="/ishan-sharma.jpg"
                    alt="Ishan Sharma"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/50"
                  />
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                    </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Ishan Sharma</h2>
                  <p className="text-blue-400 text-xl">Startup Founder & Tech Mentor</p>
                  <p className="text-slate-300">Tech Innovators Inc. • 12.5K followers • 4.9⭐ rating</p>
                      </div>
                    </div>
              <p className="text-slate-200 text-lg leading-relaxed">
                Serial entrepreneur with 8+ years building tech startups. Helping students transition from college to successful tech careers. 
                Book a session to get personalized guidance on AI agents, startup strategy, career growth, and tech leadership!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">📺 Watch His Content</h3>
                  <p className="text-slate-300">Explore Ishan's expertise through his YouTube videos</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                      }`}
                    >
                      {category === 'all' ? 'All Videos' : category}
                    </button>
                ))}
              </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {videosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-slate-300">Loading Ishan's videos...</span>
                    </div>
                  ) : (
                    filteredVideos.map((video, index) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex space-x-4">
                          <div className="relative">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-32 h-20 rounded-lg object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                              {video.duration}
                            </div>
                            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm leading-tight mb-2 line-clamp-2">
                              {video.title}
                            </h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-2 line-clamp-2">
                              {video.description}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-slate-500">
                              <span>{video.views} views</span>
                              <span>•</span>
                              <span>{video.publishedAt}</span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                {video.category}
                              </span>
            </div>
              </div>
                  </div>
                      </a>
                    ))
                  )}
                </div>
                  </div>

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">⏰ Book Your Session</h3>
                  <p className="text-slate-300">Choose a time that works for you</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Available Time Slots</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && handleBookSession(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          slot.available
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:scale-105'
                            : 'bg-slate-600/50 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold">{slot.time}</div>
                        <div className="text-xs opacity-75">{slot.date}</div>
                        {!slot.available && (
                          <div className="text-xs text-red-400 mt-1">Booked</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Session Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">60 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Format:</span>
                      <span className="text-white">Video Call</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price:</span>
                      <span className="text-green-400 font-bold">Free for Students!</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preparation:</span>
                      <span className="text-white">Send questions in advance</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                  🚀 Book Free Session with Ishan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}