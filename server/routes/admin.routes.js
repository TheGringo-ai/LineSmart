import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validAdminKey = process.env.ADMIN_API_KEY || 'LINESMART_ADMIN_2024';
  
  if (adminKey !== validAdminKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid admin key'
    });
  }
  
  next();
};

// Mock data - in production, this would come from a database
const mockUsers = [
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
    revenue: 299,
    totalRevenue: 2990,
    apiCalls: 1250,
    storageUsed: '2.5 GB'
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
    revenue: 99,
    totalRevenue: 297,
    apiCalls: 340,
    storageUsed: '512 MB'
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
    revenue: 49,
    totalRevenue: 441,
    apiCalls: 780,
    storageUsed: '1.2 GB'
  },
  {
    id: 4,
    name: 'Innovation Corp',
    email: 'hello@innovation.co',
    plan: 'Enterprise',
    status: 'active',
    joinDate: '2024-06-20',
    lastLogin: '2024-10-01',
    employees: 180,
    quizzes: 67,
    revenue: 299,
    totalRevenue: 1495,
    apiCalls: 2100,
    storageUsed: '4.1 GB'
  }
];

// Get all users
router.get('/users', authenticateAdmin, (req, res) => {
  try {
    logger.info('Admin: Fetching all users');
    
    const { page = 1, limit = 10, status, plan } = req.query;
    let filteredUsers = mockUsers;
    
    // Apply filters
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    if (plan) {
      filteredUsers = filteredUsers.filter(user => user.plan === plan);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        total: filteredUsers.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    });
  } catch (error) {
    logger.error('Admin: Error fetching users', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get analytics dashboard data
router.get('/analytics', authenticateAdmin, (req, res) => {
  try {
    logger.info('Admin: Fetching analytics data');
    
    const analytics = {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      trialUsers: mockUsers.filter(u => u.status === 'trial').length,
      totalRevenue: mockUsers.reduce((sum, user) => sum + user.totalRevenue, 0),
      monthlyRevenue: mockUsers.reduce((sum, user) => sum + user.revenue, 0),
      monthlyGrowth: 23.5,
      quizzesGenerated: mockUsers.reduce((sum, user) => sum + user.quizzes, 0),
      avgQuizScore: 84.3,
      totalApiCalls: mockUsers.reduce((sum, user) => sum + user.apiCalls, 0),
      systemHealth: 99.2,
      supportTickets: 3,
      planDistribution: {
        basic: mockUsers.filter(u => u.plan === 'Basic').length,
        professional: mockUsers.filter(u => u.plan === 'Professional').length,
        enterprise: mockUsers.filter(u => u.plan === 'Enterprise').length
      },
      revenueByPlan: {
        basic: mockUsers.filter(u => u.plan === 'Basic').reduce((sum, user) => sum + user.totalRevenue, 0),
        professional: mockUsers.filter(u => u.plan === 'Professional').reduce((sum, user) => sum + user.totalRevenue, 0),
        enterprise: mockUsers.filter(u => u.plan === 'Enterprise').reduce((sum, user) => sum + user.totalRevenue, 0)
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Admin: Error fetching analytics', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get specific user details
router.get('/users/:id', authenticateAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info('Admin: Fetching user details', { userId });
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Admin: Error fetching user details', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

// Update user
router.put('/users/:id', authenticateAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user data
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...req.body };
    
    logger.info('Admin: User updated', { userId, updates: req.body });
    
    res.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Admin: Error updating user', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove user
    mockUsers.splice(userIndex, 1);
    
    logger.info('Admin: User deleted', { userId });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Admin: Error deleting user', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// AI Assistant endpoint
router.post('/ai-assistant', authenticateAdmin, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    logger.info('Admin: AI Assistant request', { message });
    
    // Mock AI responses based on message content
    const responses = {
      'user analytics': `Based on current data: You have ${mockUsers.length} total users, with ${mockUsers.filter(u => u.status === 'active').length} active. Revenue breakdown: ${mockUsers.reduce((sum, user) => sum + user.totalRevenue, 0)} total. Top performing plan is Enterprise with ${mockUsers.filter(u => u.plan === 'Enterprise').length} users.`,
      'revenue analysis': `Revenue insights: Total revenue is $${mockUsers.reduce((sum, user) => sum + user.totalRevenue, 0).toLocaleString()}. Monthly recurring revenue: $${mockUsers.reduce((sum, user) => sum + user.revenue, 0)}. Enterprise plan generates the highest revenue per user.`,
      'growth recommendations': 'Based on your user data, I recommend: 1) Focus on converting trial users to paid plans, 2) Upsell Basic users to Professional tier, 3) Implement referral program for Enterprise clients, 4) Add advanced analytics features to justify premium pricing.',
      'system health': `System is performing excellently at 99.2% uptime. API calls are distributed well across users. Storage usage is optimized. I recommend monitoring the top Enterprise users for any scaling needs.`,
      'marketing strategy': 'Marketing recommendations: 1) Target manufacturing companies with 50-250 employees, 2) Highlight AI-powered training ROI, 3) Create case studies from your Enterprise clients, 4) Implement freemium model to capture more leads.',
      'default': `I can help you analyze your LineSmart platform data. Current overview: ${mockUsers.length} users, $${mockUsers.reduce((sum, user) => sum + user.totalRevenue, 0).toLocaleString()} total revenue, ${mockUsers.reduce((sum, user) => sum + user.quizzes, 0)} quizzes generated. What specific area would you like to explore?`
    };
    
    const responseKey = Object.keys(responses).find(key => 
      message.toLowerCase().includes(key.replace(' ', ''))
    ) || 'default';
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      data: {
        response: responses[responseKey],
        timestamp: new Date().toISOString(),
        context: context || 'admin-dashboard'
      }
    });
  } catch (error) {
    logger.error('Admin: AI Assistant error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'AI Assistant request failed'
    });
  }
});

// System health check
router.get('/health', authenticateAdmin, (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        ai_services: 'operational',
        file_storage: 'available',
        email_service: 'active'
      }
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Admin: Health check error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

export default router;