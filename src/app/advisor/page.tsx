'use client';

import { useState } from 'react';
import TaskCompletionTest from '@/components/TaskCompletionTest';

interface Task {
  id: string;
  text: string;
  type: string;
  xp: number;
}

interface Month {
  title: string;
  skills: string[];
  projects: string[];
  tools: string[];
  tasks: Task[];
  xp: number;
  completed: boolean;
}

interface RoadmapData {
  career: string;
  months: Month[];
  totalXP: number;
  earnedXP: number;
  level: number;
  achievements: any[];
}

export default function AdvisorPage() {
  const [careerGoal, setCareerGoal] = useState('');
  const [currentPhase, setCurrentPhase] = useState('beginner');
  const [roadmap, setRoadmap] = useState('');
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Parse roadmap data for gamification
  const parseRoadmapData = (roadmapText: string, career: string): RoadmapData => {
    const months: Month[] = [];
    const lines = roadmapText.split('\n');
    let currentMonth: Month | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('Month 1:') || line.includes('Month 2:') || line.includes('Month 3:') || 
          line.includes('Month 4:') || line.includes('Month 5:') || line.includes('Month 6:')) {
        if (currentMonth) months.push(currentMonth);
        currentMonth = {
          title: line.replace(/\*\*/g, ''),
          skills: [],
          projects: [],
          tools: [],
          tasks: [],
          xp: 50,
          completed: false
        };
      } else if (currentMonth && line.includes('Key Skills:')) {
        const skillsText = line.replace(/.*Key Skills:\s*/, '');
        currentMonth.skills = skillsText.split(',').map(s => s.trim()).filter(s => s).slice(0, 3);
      } else if (currentMonth && line.includes('Projects:')) {
        const projectsText = line.replace(/.*Projects:\s*/, '');
        currentMonth.projects = projectsText.split(',').map(p => p.trim()).filter(p => p).slice(0, 2);
      } else if (currentMonth && line.includes('Tools:')) {
        const toolsText = line.replace(/.*Tools:\s*/, '');
        currentMonth.tools = toolsText.split(',').map(t => t.trim()).filter(t => t).slice(0, 4);
      }
    }
    
    if (currentMonth) months.push(currentMonth);
    
    // Generate tasks for each month (max 5 per month)
    months.forEach((month, index) => {
      month.tasks = [
        ...month.skills.slice(0, 2).map(skill => ({ id: `skill-${index}-${skill}`, text: skill, type: 'skill', xp: 15 })),
        ...month.projects.slice(0, 1).map(project => ({ id: `project-${index}-${project}`, text: project, type: 'project', xp: 30 })),
        ...month.tools.slice(0, 2).map(tool => ({ id: `tool-${index}-${tool}`, text: tool, type: 'tool', xp: 10 }))
      ];
    });
    
    return {
      career,
      months,
      totalXP: months.reduce((sum, month) => sum + month.xp, 0),
      earnedXP: 0,
      level: 1,
      achievements: []
    };
  };

  const toggleTask = async (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    const wasCompleted = newCompleted.has(taskId);
    
    if (wasCompleted) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    
    // Update roadmap data
    if (roadmapData) {
      const newRoadmapData = { ...roadmapData };
      newRoadmapData.earnedXP = (Array.from(newCompleted) as string[]).reduce((total: number, taskId: string) => {
        const task = newRoadmapData.months.flatMap(m => m.tasks).find(t => t.id === taskId);
        return total + (task ? task.xp : 0);
      }, 0);
      newRoadmapData.level = Math.floor(newRoadmapData.earnedXP / 200) + 1;
      setRoadmapData(newRoadmapData);
      
      // Sync achievements to dashboard
      syncAchievements(newRoadmapData, newCompleted as Set<string>);

      // If task was just completed (not uncompleted), trigger Make.com webhook
      if (!wasCompleted && newCompleted.has(taskId)) {
        const task = newRoadmapData.months.flatMap(m => m.tasks).find(t => t.id === taskId);
        if (task) {
          try {
            await fetch('/api/task-completion', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: 'user_' + Date.now(), // In a real app, get from auth
                task_id: taskId,
                task_name: task.text,
                xp_earned: task.xp,
                total_xp: newRoadmapData.totalXP,
                level: newRoadmapData.level,
                career_goal: newRoadmapData.career,
                user_email: 'user@example.com' // In a real app, get from user profile
              }),
            });
          } catch (error) {
            console.error('Failed to send task completion notification:', error);
          }
        }
      }
    }
  };

  // Sync achievements to dashboard localStorage
  const syncAchievements = (roadmapData: RoadmapData, completedTasks: Set<string>) => {
    const totalTasks = roadmapData.months.flatMap((m: Month) => m.tasks).length;
    const completionPercentage = (completedTasks.size / totalTasks) * 100;
    
    const achievements = [
      { id: 'first-task', name: 'First Steps', desc: 'Complete your first task', icon: '👶', unlocked: completedTasks.size >= 1 },
      { id: 'level-2', name: 'Rising Star', desc: 'Reach Level 2 (200+ XP)', icon: '⭐', unlocked: roadmapData.level >= 2 },
      { id: 'half-way', name: 'Halfway Hero', desc: 'Complete 50% of all tasks', icon: '🎯', unlocked: completionPercentage >= 50 }
    ];
    
    localStorage.setItem('ignite-achievements', JSON.stringify(achievements));
  };

  const generateRoadmap = async () => {
    if (!careerGoal.trim()) {
      setError('Please enter your career goal');
      return;
    }

    setIsLoading(true);
    setError('');
    setRoadmap('');

    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ careerGoal, currentPhase }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      setRoadmap(data.roadmap);
      
      // Parse and structure the roadmap data for gamification
      const structuredData = parseRoadmapData(data.roadmap, careerGoal);
      setRoadmapData(structuredData);
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
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
            className="text-blue-400 font-medium"
          >
            Advisor
          </a>
          <a 
            href="/dashboard" 
            className="text-slate-300 hover:text-purple-400 transition-colors duration-200 font-medium"
          >
            Dashboard
          </a>
          <a 
            href="/community" 
            className="text-slate-300 hover:text-pink-400 transition-colors duration-200 font-medium"
          >
            Community
          </a>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200">
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative px-6 lg:px-16 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Your AI Academic Guide
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get a personalized 6-month learning roadmap tailored to your career goals and current industry trends
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="career-goal" className="block text-lg font-semibold text-white mb-3">
                  What's your dream career? 🚀
                </label>
                <input
                  id="career-goal"
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g., I want to be a Data Scientist, Software Engineer, Product Manager..."
                  className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="current-phase" className="block text-lg font-semibold text-white mb-3">
                  What's your current level? 📊
                </label>
                <select
                  id="current-phase"
                  value={currentPhase}
                  onChange={(e) => setCurrentPhase(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg"
                  disabled={isLoading}
                >
                  <option value="beginner">Beginner - Just starting out</option>
                  <option value="intermediate">Intermediate - Some experience</option>
                  <option value="advanced">Advanced - Looking to specialize</option>
                  <option value="expert">Expert - Want to stay current</option>
                </select>
              </div>
              
              <button
                onClick={generateRoadmap}
                disabled={isLoading || !careerGoal.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating your roadmap...
                  </div>
                ) : (
                  'Generate Roadmap ✨'
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Gamified Roadmap Results */}
          {roadmapData && (
            <div className="space-y-8">
              {/* Progress Header */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Your 6-Month Journey</h2>
                      <p className="text-slate-300">Level {roadmapData.level} • {roadmapData.earnedXP} / {roadmapData.totalXP} XP</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{Math.round((roadmapData.earnedXP / roadmapData.totalXP) * 100)}%</div>
                    <div className="text-slate-300">Complete</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(roadmapData.earnedXP / roadmapData.totalXP) * 100}%` }}
                  ></div>
                </div>
                
                {/* XP Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-blue-400 font-bold">{roadmapData.earnedXP}</div>
                    <div className="text-slate-400 text-sm">XP Earned</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-purple-400 font-bold">{roadmapData.level}</div>
                    <div className="text-slate-400 text-sm">Level</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-green-400 font-bold">{completedTasks.size}</div>
                    <div className="text-slate-400 text-sm">Tasks Done</div>
                  </div>
                </div>
              </div>

              {/* Monthly Roadmaps */}
              <div className="grid md:grid-cols-2 gap-4">
                {roadmapData.months.map((month, monthIndex) => (
                  <div key={monthIndex} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">{month.title}</h3>
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{monthIndex + 1}</span>
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {month.tools.map((tool, toolIndex) => (
                          <span key={toolIndex} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1">
                      {month.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded hover:bg-slate-700/50 transition-colors">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              completedTasks.has(task.id)
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-400 hover:border-green-400'
                            }`}
                          >
                            {completedTasks.has(task.id) && <span className="text-white text-xs">✓</span>}
                          </button>
                          <span className={`text-sm flex-1 ${completedTasks.has(task.id) ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {task.text}
                          </span>
                          <span className="text-xs text-slate-400">{task.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span>🏆</span> Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { 
                      id: 'first-task', 
                      name: 'First Steps', 
                      desc: 'Complete your first task',
                      icon: '👶', 
                      unlocked: completedTasks.size >= 1,
                      progress: `${completedTasks.size >= 1 ? 1 : 0}/1`
                    },
                    { 
                      id: 'level-2', 
                      name: 'Rising Star', 
                      desc: 'Reach Level 2 (200+ XP)',
                      icon: '⭐', 
                      unlocked: roadmapData.level >= 2,
                      progress: `Level ${roadmapData.level}`
                    },
                    { 
                      id: 'half-way', 
                      name: 'Halfway Hero', 
                      desc: 'Complete 50% of all tasks',
                      icon: '🎯', 
                      unlocked: (completedTasks.size / roadmapData.months.flatMap(m => m.tasks).length) >= 0.5,
                      progress: `${Math.round((completedTasks.size / roadmapData.months.flatMap(m => m.tasks).length) * 100)}%`
                    }
                  ].map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-lg transition-all ${
                      achievement.unlocked 
                        ? 'bg-yellow-500/20 border border-yellow-500/50' 
                        : 'bg-slate-700/30 border border-slate-600'
                    }`}>
                      <div className="text-center mb-2">
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <div className={`font-semibold ${achievement.unlocked ? 'text-yellow-300' : 'text-slate-400'}`}>
                          {achievement.name}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 text-center mb-2">
                        {achievement.desc}
                      </div>
                      <div className={`text-xs text-center font-medium ${
                        achievement.unlocked ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {achievement.progress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test Component */}
          <div className="mt-16">
            <TaskCompletionTest />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-slate-400 text-sm">Personalized recommendations based on industry trends</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">6-Month Cycles</h3>
              <p className="text-slate-400 text-sm">Dynamic roadmap that adapts to industry trends</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Practical Skills</h3>
              <p className="text-slate-400 text-sm">Focus on real-world applications and projects</p>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </main>
    </div>
  );
}
