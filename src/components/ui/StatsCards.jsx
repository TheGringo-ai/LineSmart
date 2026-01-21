import React from 'react';
import { Users, Target, BookOpen, TrendingUp } from 'lucide-react';

/**
 * Dashboard statistics cards component
 */
export const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Avg. Completion',
      value: `${stats.avgCompletion}%`,
      icon: Target,
      color: 'green'
    },
    {
      title: 'Active Trainings',
      value: stats.activeTrainings,
      icon: BookOpen,
      color: 'orange'
    },
    {
      title: 'Avg. Performance',
      value: `${stats.avgPerformance}%`,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${colorClasses[card.color]}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
