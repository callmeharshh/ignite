'use client';

import { useState, useEffect } from 'react';
import EmailAuth from '@/components/EmailAuth';

interface Profile {
  name: string;
  grade: string;
  careerGoal: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  loginTime: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({ name: '', grade: '', careerGoal: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('ignite-profile');
    const savedProjects = localStorage.getItem('ignite-projects');
    const savedAchievements = localStorage.getItem('ignite-achievements');
    const savedUser = localStorage.getItem('ignite-user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (savedUser) {
      setShowProfileForm(true);
    }

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      const defaultAchievements = [
        { id: 'profile-complete', name: 'Profile Master', desc: 'Complete your profile setup', icon: '👤', unlocked: false },
        { id: 'first-project', name: 'Project Pioneer', desc: 'Add your first project', icon: '🚀', unlocked: false },
        { id: 'skill-builder', name: 'Skill Builder', desc: 'Complete 5 tasks in Advisor', icon: '⚡', unlocked: false },
        { id: 'achievement-hunter', name: 'Achievement Hunter', desc: 'Unlock 3 achievements', icon: '🏆', unlocked: false }
      ];
      setAchievements(defaultAchievements);
    }
  }, []);

  // Email login handler
  const handleEmailLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('ignite-user', JSON.stringify(userData));
    
    if (!profile.name) {
      setShowProfileForm(true);
    }
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('ignite-user');
    setShowProfileForm(true);
  };

  // Save profile to localStorage
  const saveProfile = () => {
    if (!profile.name.trim() || !profile.grade.trim() || !profile.careerGoal.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    localStorage.setItem('ignite-profile', JSON.stringify(profile));
    setShowProfileForm(false);
    
    unlockAchievement('profile-complete');
  };

  // Pre-fill profile with user data
  useEffect(() => {
    if (user && !profile.name) {
      setProfile(prev => ({
        ...prev,
        name: user.name || user.email.split('@')[0],
      }));
    }
  }, [user, profile.name]);

  // Add project
  const addProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      createdAt: new Date().toLocaleDateString()
    };

    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    localStorage.setItem('ignite-projects', JSON.stringify(updatedProjects));
    setNewProject({ title: '', description: '' });
    setShowProjectForm(false);

    if (projects.length === 0) {
      unlockAchievement('first-project');
    }
  };

  // Delete project
  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('ignite-projects', JSON.stringify(updatedProjects));
  };

  // Unlock achievement
  const unlockAchievement = (achievementId: string) => {
    const updatedAchievements = achievements.map(achievement => 
      achievement.id === achievementId && !achievement.unlocked
        ? { ...achievement, unlocked: true, unlockedAt: new Date().toLocaleDateString() }
        : achievement
    );
    setAchievements(updatedAchievements);
    localStorage.setItem('ignite-achievements', JSON.stringify(updatedAchievements));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-16">
        <a href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Ignite
        </a>
        <div className="hidden md:flex items-center space-x-8">
          <a 
            href="/advisor" 
            className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Advisor
          </a>
          <a 
            href="/dashboard" 
            className="text-blue-400 font-medium"
          >
            Dashboard
          </a>
          <a 
            href="/community" 
            className="text-slate-300 hover:text-pink-400 transition-colors duration-200 font-medium"
          >
            Community
          </a>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300 text-sm">{user?.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">
              Sign in to access your dashboard
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          {!isLoggedIn ? (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Welcome to Ignite
                </h1>
                <p className="text-xl text-slate-400 mb-8">
                  Enter your email to get started and access your personalized dashboard
                </p>
                
                <EmailAuth 
                  onLogin={handleEmailLogin}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
                
                <p className="text-sm text-slate-500 mt-6">
                  Your data is stored locally and securely on your device
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Welcome back! 👋
                </h1>
                <p className="text-xl text-slate-400">
                  Track your progress, showcase your projects, and celebrate your achievements
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Logged in as: {user?.email}
                </p>
              </div>

              {/* Profile Section */}
              <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>👤</span>
                    <span>Profile</span>
                  </h2>
                  <button
                    onClick={() => setShowProfileForm(!showProfileForm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {profile.name ? 'Edit' : 'Create'} Profile
                  </button>
                </div>

                {showProfileForm ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Grade/Level (e.g., 12th Grade, College Freshman)"
                        value={profile.grade}
                        onChange={(e) => setProfile({...profile, grade: e.target.value})}
                        className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Career Goal (e.g., Data Scientist)"
                        value={profile.careerGoal}
                        onChange={(e) => setProfile({...profile, careerGoal: e.target.value})}
                        className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={saveProfile}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Save Profile
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Name</div>
                      <div className="text-white font-medium">{profile.name || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Grade/Level</div>
                      <div className="text-white font-medium">{profile.grade || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Career Goal</div>
                      <div className="text-white font-medium">{profile.careerGoal || 'Not set'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Projects Section */}
              <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span>🚀</span>
                    <span>Your Projects</span>
                  </h2>
                  <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Project
                  </button>
                </div>

                {showProjectForm ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
                    />
                    <textarea
                      placeholder="Project Description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:outline-none resize-none"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={addProject}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        Add Project
                      </button>
                      <button
                        onClick={() => setShowProjectForm(false)}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
                    <p className="text-slate-500 mb-6">Start building your portfolio by adding your first project!</p>
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Add Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{project.description}</p>
                        <div className="text-slate-500 text-xs">Added {project.createdAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Section */}
              <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3 mb-6">
                  <span>🏆</span>
                  <span>Achievements</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                        : 'bg-slate-700/30 border-slate-600'
                    }`}>
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h3 className={`font-semibold mb-1 ${
                        achievement.unlocked ? 'text-yellow-300' : 'text-slate-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-yellow-200' : 'text-slate-500'
                      }`}>
                        {achievement.desc}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-yellow-300 mt-2">
                          Unlocked {achievement.unlockedAt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </main>
    </div>
  );
}