import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, MessageSquare, Shield, Database, 
  Globe, TrendingUp, Activity, Bell, Search, Filter, Plus, 
  Edit, Trash2, Eye, Download, Upload, RefreshCw, Zap,
  Code, Smartphone, Monitor, Brain, Lightbulb, Target,
  DollarSign, UserCheck, Clock, AlertTriangle, CheckCircle, X
} from 'lucide-react';

const AdminDashboard = ({ onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Acme Manufacturing',
      email: 'admin@acme.com',
      plan: 'Enterprise',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-10-02',
      employees: 250,
      quizzes: 45,
      revenue: 299
    },
    {
      id: 2,
      name: 'Tech Industries',
      email: 'contact@techind.com',
      plan: 'Professional',
      status: 'trial',
      joinDate: '2024-09-28',
      lastLogin: '2024-10-01',
      employees: 50,
      quizzes: 12,
      revenue: 99
    },
    {
      id: 3,
      name: 'Global Logistics',
      email: 'info@globallog.com',
      plan: 'Basic',
      status: 'active',
      joinDate: '2024-08-12',
      lastLogin: '2024-09-30',
      employees: 75,
      quizzes: 23,
      revenue: 49
    }
  ]);

  const [analytics, setAnalytics] = useState({
    totalUsers: 156,
    activeUsers: 142,
    totalRevenue: 12450,
    monthlyGrowth: 23.5,
    quizzesGenerated: 1247,
    avgQuizScore: 84.3,
    supportTickets: 3,
    systemHealth: 99.2
  });

  const [aiAssistantMessages, setAiAssistantMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      message: 'Welcome to your LineSmart Admin Dashboard! I\'m your AI assistant. I can help you manage users, analyze performance, generate reports, and develop new features. What would you like to work on today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message,
      timestamp: new Date().toISOString()
    };
    setAiAssistantMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiLoading(true);

    // Simulate AI response (in production, this would call your AI service)
    setTimeout(() => {
      const responses = {
        'user management': 'I can help you manage users! Currently you have 156 total users with 142 active. I can show you user analytics, handle user permissions, or help with customer support. Would you like me to analyze user engagement patterns or help with a specific user issue?',
        'analytics': 'Your platform is performing excellently! Revenue is up 23.5% this month ($12,450 total), quiz generation is strong at 1,247 quizzes, and system health is at 99.2%. The average quiz score is 84.3%. Would you like me to generate a detailed analytics report or focus on a specific metric?',
        'development': 'I can assist with platform development! I can help you plan new features, review code, generate API endpoints, create new components, or optimize performance. What development task would you like to work on?',
        'marketing': 'For marketing and promotion, I can help you create content, analyze user acquisition costs, generate promotional materials, plan feature announcements, or develop pricing strategies. Your current conversion rate and user growth look strong!',
        'revenue': `Your revenue metrics are strong! Total revenue: $12,450, Monthly growth: 23.5%. Enterprise plans ($299) are your highest value. I recommend focusing on converting trial users to paid plans and upselling Basic users to Professional.`,
        'default': 'I\'m here to help you manage LineSmart! I can assist with user management, analytics, development, marketing, technical support, or any other admin tasks. Try asking me about specific areas like "show me user analytics" or "help me plan new features".'
      };

      const responseKey = Object.keys(responses).find(key => 
        message.toLowerCase().includes(key)
      ) || 'default';

      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        message: responses[responseKey],
        timestamp: new Date().toISOString()
      };

      setAiAssistantMessages(prev => [...prev, aiResponse]);
      setIsAiLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'development', label: 'Development', icon: Code },
    { id: 'marketing', label: 'Marketing', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Monthly Revenue</p>
              <p className="text-3xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Growth Rate</p>
              <p className="text-3xl font-bold">{analytics.monthlyGrowth}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">System Health</p>
              <p className="text-3xl font-bold">{analytics.systemHealth}%</p>
            </div>
            <Activity className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
          <div className="space-y-3">
            {users.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">Last login: {user.lastLogin}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Add User</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Download className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">Export Data</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-purple-700 font-medium">AI Analysis</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-orange-600" />
              <span className="text-orange-700 font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                      user.plan === 'Professional' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.employees}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.revenue}/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAiAssistant = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 h-96 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>LineSmart AI Assistant</span>
          </h3>
          <p className="text-sm text-gray-500">Your personal AI assistant for managing and developing LineSmart</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiAssistantMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-lg p-3 ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAiMessage(aiInput)}
              placeholder="Ask your AI assistant anything about LineSmart..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={() => handleAiMessage(aiInput)}
              disabled={isAiLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Show user analytics', 'Help me plan new features', 'Generate marketing content', 'Review revenue metrics'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleAiMessage(suggestion)}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'ai-assistant':
        return renderAiAssistant();
      case 'analytics':
        return (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Advanced analytics dashboard coming soon...</p>
          </div>
        );
      case 'development':
        return (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Development tools and code management coming soon...</p>
          </div>
        );
      case 'marketing':
        return (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Marketing and promotional tools coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Advanced settings panel coming soon...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">LineSmart Admin Dashboard</h2>
                <p className="text-purple-100">Platform management and development control center</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;