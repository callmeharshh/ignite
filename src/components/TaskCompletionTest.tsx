'use client';

import { useState } from 'react';

export default function TaskCompletionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const testTaskCompletion = async () => {
    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/task-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test_user_' + Date.now(),
          task_id: 'test-skill-react',
          task_name: 'Learn React Basics',
          xp_earned: 15,
          total_xp: 150,
          level: 2,
          career_goal: 'Software Engineer',
          user_email: 'test@example.com'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult('✅ Task completion notification sent successfully! Check your Make.com scenario logs.');
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🧪</span> Test Make.com Integration
      </h3>
      
      <p className="text-slate-400 mb-4 text-sm">
        Click the button below to test the Make.com webhook integration. This will simulate a task completion and trigger your workflow.
      </p>

      <button
        onClick={testTaskCompletion}
        disabled={isLoading}
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Testing...
          </div>
        ) : (
          'Test Task Completion Webhook'
        )}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          result.includes('✅') 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {result}
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">
        <p><strong>Note:</strong> Make sure you have:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Created the Make.com scenario</li>
          <li>Added the webhook URL to your .env.local file</li>
          <li>Activated the scenario in Make.com</li>
        </ul>
      </div>
    </div>
  );
}
