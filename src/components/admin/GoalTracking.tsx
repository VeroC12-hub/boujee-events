import React, { useState } from 'react';

interface Metrics {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  vipReservations: number;
  eventGrowth: string;
  revenueGrowth: string;
  attendeeGrowth: string;
  vipGrowth: string;
}

interface GoalTrackingProps {
  currentMetrics: Metrics;
}

const GoalTracking: React.FC<GoalTrackingProps> = ({ currentMetrics }) => {
  const [goals] = useState([
    {
      id: 1,
      title: 'Monthly Revenue Target',
      target: 50000,
      current: currentMetrics.totalRevenue,
      unit: '$',
      category: 'revenue',
      deadline: '2025-08-31'
    },
    {
      id: 2,
      title: 'Event Count Goal',
      target: 20,
      current: currentMetrics.totalEvents,
      unit: 'events',
      category: 'events',
      deadline: '2025-08-31'
    },
    {
      id: 3,
      title: 'VIP Conversion Target',
      target: 100,
      current: currentMetrics.vipReservations,
      unit: 'bookings',
      category: 'vip',
      deadline: '2025-08-31'
    },
    {
      id: 4,
      title: 'Attendee Growth',
      target: 5000,
      current: currentMetrics.totalAttendees,
      unit: 'attendees',
      category: 'growth',
      deadline: '2025-08-31'
    }
  ]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return '💰';
      case 'events': return '📅';
      case 'vip': return '🌟';
      case 'growth': return '📈';
      default: return '🎯';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Goal Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor progress towards your targets</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors">
          + Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal.current, goal.target);
          const progressColor = getProgressColor(progress);
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getCategoryIcon(goal.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    of {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target.toLocaleString()} ${goal.unit}`}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Remaining: {goal.unit === '$' ? `$${(goal.target - goal.current).toLocaleString()}` : `${goal.target - goal.current} ${goal.unit}`}
                </span>
                <span className={`font-medium ${progress >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                  {progress >= 100 ? '🎉 Completed!' : `${Math.ceil((goal.target - goal.current) / 30)} ${goal.unit}/day needed`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Goal Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {goals.filter(g => getProgressPercentage(g.current, g.target) >= 100).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {goals.filter(g => {
                const p = getProgressPercentage(g.current, g.target);
                return p >= 60 && p < 100;
              }).length}
            </div>
            <div className="text-sm text-gray-600">On Track</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {goals.filter(g => {
                const p = getProgressPercentage(g.current, g.target);
                return p >= 40 && p < 60;
              }).length}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {goals.filter(g => getProgressPercentage(g.current, g.target) < 40).length}
            </div>
            <div className="text-sm text-gray-600">Behind</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTracking;