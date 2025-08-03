import React, { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
  type: 'revenue' | 'events' | 'attendees' | 'vip';
  target: number;
  current: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  createdAt: string;
  description?: string;
}

interface GoalTrackingProps {
  currentMetrics: {
    totalRevenue: number;
    totalEvents: number;
    totalAttendees: number;
    vipReservations: number;
  };
}

const GoalTracking: React.FC<GoalTrackingProps> = ({ currentMetrics }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: '',
    type: 'revenue',
    target: 0,
    deadline: '',
    description: ''
  });

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('eventhub-goals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Error loading goals from localStorage:', error);
        initializeDefaultGoals();
      }
    } else {
      initializeDefaultGoals();
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('eventhub-goals', JSON.stringify(goals));
  }, [goals]);

  // Update goal progress when metrics change
  useEffect(() => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        let updatedCurrent = goal.current;
        
        switch (goal.type) {
          case 'revenue':
            updatedCurrent = currentMetrics.totalRevenue;
            break;
          case 'events':
            updatedCurrent = currentMetrics.totalEvents;
            break;
          case 'attendees':
            updatedCurrent = currentMetrics.totalAttendees;
            break;
          case 'vip':
            updatedCurrent = currentMetrics.vipReservations;
            break;
        }

        // Auto-update status based on progress and deadline
        const progress = (updatedCurrent / goal.target) * 100;
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let newStatus: Goal['status'] = 'on-track';
        
        if (progress >= 100) {
          newStatus = 'completed';
        } else if (daysLeft < 0) {
          newStatus = 'behind';
        } else if (daysLeft <= 7 && progress < 80) {
          newStatus = 'at-risk';
        } else if (daysLeft <= 30 && progress < 50) {
          newStatus = 'at-risk';
        }

        return {
          ...goal,
          current: updatedCurrent,
          status: newStatus
        };
      })
    );
  }, [currentMetrics]);

  const initializeDefaultGoals = () => {
    const defaultGoals: Goal[] = [
      {
        id: '1',
        name: 'Q4 Revenue Target',
        type: 'revenue',
        target: 100000,
        current: currentMetrics.totalRevenue,
        deadline: '2025-12-31',
        status: 'on-track',
        createdAt: '2025-08-03T11:23:06Z',
        description: 'Reach $100k in total revenue by end of Q4'
      },
      {
        id: '2',
        name: 'Monthly Events Goal',
        type: 'events',
        target: 50,
        current: currentMetrics.totalEvents,
        deadline: '2025-08-31',
        status: 'behind',
        createdAt: '2025-08-03T11:23:06Z',
        description: 'Host 50 events this month'
      },
      {
        id: '3',
        name: 'Total Attendees YTD',
        type: 'attendees',
        target: 10000,
        current: currentMetrics.totalAttendees,
        deadline: '2025-12-31',
        status: 'on-track',
        createdAt: '2025-08-03T11:23:06Z',
        description: 'Reach 10,000 total attendees this year'
      },
      {
        id: '4',
        name: 'VIP Bookings Target',
        type: 'vip',
        target: 200,
        current: currentMetrics.vipReservations,
        deadline: '2025-10-31',
        status: 'at-risk',
        createdAt: '2025-08-03T11:23:06Z',
        description: 'Get 200 VIP reservations by Halloween'
      }
    ];
    setGoals(defaultGoals);
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'behind': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'on-track': return '📈';
      case 'at-risk': return '⚠️';
      case 'behind': return '📉';
      default: return '🎯';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'revenue': return '💰';
      case 'events': return '📅';
      case 'attendees': return '👥';
      case 'vip': return '🌟';
      default: return '🎯';
    }
  };

  const formatValue = (value: number, type: Goal['type']) => {
    switch (type) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  const addOrUpdateGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      if ((window as any).toast) {
        (window as any).toast.error('Please fill in all required fields');
      }
      return;
    }

    if (editingGoal) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? {
              ...goal,
              name: newGoal.name!,
              type: newGoal.type!,
              target: newGoal.target!,
              deadline: newGoal.deadline!,
              description: newGoal.description || ''
            }
          : goal
      ));
      
      if ((window as any).toast) {
        (window as any).toast.success('Goal updated successfully!');
      }
    } else {
      // Add new goal
      const goal: Goal = {
        id: Date.now().toString(),
        name: newGoal.name!,
        type: newGoal.type!,
        target: newGoal.target!,
        current: currentMetrics[newGoal.type === 'revenue' ? 'totalRevenue' : 
                              newGoal.type === 'events' ? 'totalEvents' :
                              newGoal.type === 'attendees' ? 'totalAttendees' : 'vipReservations'],
        deadline: newGoal.deadline!,
        status: 'on-track',
        createdAt: new Date().toISOString(),
        description: newGoal.description || ''
      };

      setGoals(prev => [...prev, goal]);
      
      if ((window as any).toast) {
        (window as any).toast.success('Goal added successfully!');
      }
    }

    // Reset form
    setNewGoal({ name: '', type: 'revenue', target: 0, deadline: '', description: '' });
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  const deleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      if ((window as any).toast) {
        (window as any).toast.success('Goal deleted successfully!');
      }
    }
  };

  const editGoal = (goal: Goal) => {
    setNewGoal({
      name: goal.name,
      type: goal.type,
      target: goal.target,
      deadline: goal.deadline,
      description: goal.description || ''
    });
    setEditingGoal(goal);
    setShowAddGoal(true);
  };

  const getOverallProgress = () => {
    if (goals.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = goals.filter(goal => goal.status === 'completed').length;
    const total = goals.length;
    const percentage = (completed / total) * 100;
    
    return { completed, total, percentage };
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Header with Overall Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🎯 Goal Tracking</h2>
            <p className="text-blue-100 mt-1">Track your progress towards key objectives</p>
            <p className="text-xs text-blue-200 mt-2">
              Last updated: 2025-08-03 11:23:06 UTC | User: VeroC12-hub
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">{overallProgress.completed}/{overallProgress.total}</div>
            <div className="text-sm text-blue-100">Goals Completed</div>
            <div className="text-xs text-blue-200">{overallProgress.percentage.toFixed(0)}% Overall</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['completed', 'on-track', 'at-risk', 'behind'] as const).map(status => {
          const count = goals.filter(goal => goal.status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getStatusIcon(status)}</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Goals ({goals.length})</h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">➕</span>
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-6xl block mb-4">🎯</span>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Goals Set</h3>
          <p className="text-gray-600 mb-4">Start tracking your progress by creating your first goal!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current, goal.target);
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Goal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(goal.type)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                        <span className="mr-1">{getStatusIcon(goal.status)}</span>
                        {goal.status.replace('-', ' ')}
                      </span>
                      
                      <div className="relative">
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            const menu = document.getElementById(`goal-menu-${goal.id}`);
                            if (menu) {
                              menu.classList.toggle('hidden');
                            }
                          }}
                        >
                          ⋮
                        </button>
                        <div id={`goal-menu-${goal.id}`} className="hidden absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => editGoal(goal)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <div className="font-semibold text-lg">
                        {formatValue(goal.current, goal.type)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Target:</span>
                      <div className="font-semibold text-lg">
                        {formatValue(goal.target, goal.type)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Deadline:</span>
                      <div className="font-medium">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Days Left:</span>
                      <div className={`font-medium ${
                        daysLeft < 0 ? 'text-red-600' : 
                        daysLeft < 7 ? 'text-yellow-600' : 
                        daysLeft < 30 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today!' : `${daysLeft} days`}
                      </div>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  {goal.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm font-medium">🎉 Congratulations! You've achieved this goal!</p>
                    </div>
                  )}
                  
                  {goal.status === 'at-risk' && daysLeft > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm font-medium">⚡ Push harder! You're behind pace but there's still time!</p>
                    </div>
                  )}
                  
                  {goal.status === 'behind' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">🚨 This goal needs immediate attention!</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingGoal ? '✏️ Edit Goal' : '➕ Add New Goal'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={newGoal.name || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Q4 Revenue Target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Optional description of your goal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type *</label>
                  <select
                    value={newGoal.type || 'revenue'}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="revenue">💰 Revenue</option>
                    <option value="events">📅 Events</option>
                    <option value="attendees">👥 Attendees</option>
                    <option value="vip">🌟 VIP Reservations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.target || ''}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                <input
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                  setNewGoal({ name: '', type: 'revenue', target: 0, deadline: '', description: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addOrUpdateGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracking;
