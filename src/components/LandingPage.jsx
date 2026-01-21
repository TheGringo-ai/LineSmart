import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Star, Users, Brain, Zap, Shield, Globe, Play, Upload, FileText, Award, Sparkles, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

const LandingPage = ({ onDemoAccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleDemoRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Send demo request to your email
    try {
      const demoData = {
        email,
        password,
        companyName,
        timestamp: new Date().toISOString(),
        source: 'landing_page'
      };

      // In a real implementation, this would send to your backend
      // For now, we'll simulate the API call
      await fetch('mailto:scribbleglass@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'scribbleglass@gmail.com',
          subject: `LineSmart Demo Request - ${companyName}`,
          body: `New demo request:\n\nCompany: ${companyName}\nEmail: ${email}\nPassword: ${password}\nTimestamp: ${demoData.timestamp}\n\nPlease activate their demo account.`
        })
      });

      setSubmitted(true);
      
      // Auto-grant demo access after 2 seconds
      setTimeout(() => {
        onDemoAccess({ email, companyName, tier: 'demo' });
      }, 2000);

    } catch (error) {
      console.error('Demo request failed:', error);
      // Still grant demo access even if email fails
      onDemoAccess({ email, companyName, tier: 'demo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Training Generation",
      description: "Generate comprehensive training modules in minutes, not weeks. Our AI understands your industry and creates relevant, engaging content.",
      demo: "🦙 Free LLaMA API included - no API keys required!"
    },
    {
      icon: Upload,
      title: "Smart Document Processing",
      description: "Upload your company documents (PDFs, videos, images) and watch AI transform them into interactive training materials.",
      demo: "Supports 10+ file formats with OCR"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Train global teams in their native language. Auto-translate content to 15+ languages with cultural context.",
      demo: "Spanish, French, German, Portuguese & more"
    },
    {
      icon: Users,
      title: "Supervisor Dashboard",
      description: "Track employee progress, assign training, and monitor compliance across departments in real-time.",
      demo: "Individual & department-wide management"
    },
    {
      icon: Award,
      title: "Automated Quizzes & Certification",
      description: "AI generates relevant quizzes based on your content. Instant feedback, retakes, and certification tracking.",
      demo: "Smart question generation from your content"
    },
    {
      icon: Shield,
      title: "Enterprise Security & Compliance",
      description: "SOC2 certified, GDPR compliant, with your choice of secure database or your own cloud storage.",
      demo: "Bank-level security with audit trails"
    }
  ];

  const stats = [
    { number: "85%", label: "Faster Training Creation", icon: Clock },
    { number: "92%", label: "Employee Engagement", icon: TrendingUp },
    { number: "60%", label: "Cost Reduction", icon: DollarSign },
    { number: "99%", label: "Compliance Rate", icon: Target }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Training Director",
      company: "TechCorp Industries",
      quote: "LineSmart transformed our training from weeks to hours. The AI-generated content is incredibly relevant and our employees love the interactive format.",
      rating: 5
    },
    {
      name: "Miguel Rodriguez",
      role: "Safety Manager",
      company: "Global Manufacturing",
      quote: "The multi-language support is game-changing. We can now train our diverse workforce effectively while maintaining compliance standards.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Learning & Development",
      company: "HealthFirst Hospital",
      quote: "The document upload feature is amazing. We uploaded our policies and LineSmart created perfect training modules automatically.",
      rating: 5
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your demo request has been sent to our team. You'll be automatically logged into your demo account in a few seconds.
          </p>
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LineSmart
              </h1>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Training with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                AI-Powered Intelligence
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate comprehensive training modules in minutes, not weeks. Upload your documents, 
              choose your language, and watch AI create engaging, compliant training for your entire workforce.
            </p>

            {/* Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border border-white/20">
                    <IconComponent className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Demo CTA */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-purple-600 font-semibold">Free Demo Access</span>
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                See LineSmart in Action
              </h3>
              
              <form onSubmit={handleDemoRequest} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Choose Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Start Free Demo</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                No credit card required • Instant access • Full features included
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Revolutionize Training
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered content generation to multi-language support, LineSmart provides 
              all the tools modern companies need for effective workforce training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-700 font-medium">✨ {feature.demo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From Documents to Training in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              No technical expertise required. Your training team can be productive in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Upload Documents</h3>
              <p className="text-gray-600 leading-relaxed">
                Drag and drop your company policies, procedures, manuals, or any training material. 
                We support PDFs, videos, images, spreadsheets, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. AI Processes Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes your documents, extracts key information, and generates 
                comprehensive training modules with quizzes, in your preferred language.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Deploy & Track</h3>
              <p className="text-gray-600 leading-relaxed">
                Assign training to individuals or departments, track progress in real-time, 
                and ensure compliance with automated reporting and certification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Forward-Thinking Companies
            </h2>
            <p className="text-xl text-gray-600">
              See what training professionals are saying about LineSmart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Companies Choose LineSmart
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join the thousands of companies that have transformed their training programs with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Save 85% Time</h3>
              <p className="text-blue-100">Create training in minutes instead of weeks</p>
            </div>
            
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Cut Costs 60%</h3>
              <p className="text-blue-100">Reduce training development and delivery costs</p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Boost Engagement</h3>
              <p className="text-blue-100">Interactive content increases completion rates</p>
            </div>
            
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ensure Compliance</h3>
              <p className="text-blue-100">Automated tracking and reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 shadow-xl border border-blue-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Training?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of companies using AI to create better training faster. 
              Start your free demo today - no credit card required.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Full access to all features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Upload unlimited documents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Generate training in 15+ languages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Free LLaMA AI included</span>
                </div>
              </div>
              
              <a 
                href="#demo-form" 
                className="block w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Free Demo Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold">LineSmart</h3>
          </div>
          <p className="text-gray-400 mb-4">AI-Powered Training Platform</p>
          <p className="text-sm text-gray-500">
            © 2025 LineSmart. All rights reserved. • Enterprise-grade security • SOC2 Certified
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
