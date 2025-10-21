import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  BookOpen,
  Video,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Download,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  File,
  Headphones,
  Star,
  TrendingUp,
  Eye,
  ThumbsUp,
  Zap,
  Shield,
  Target,
  Award
} from "lucide-react";

const HelpResources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Play },
    { id: 'booking', name: 'Booking & Shipments', icon: FileText },
    { id: 'billing', name: 'Billing & Settlement', icon: File },
    { id: 'support', name: 'Support & Contact', icon: Headphones },
  ];

  const helpResources = [
    {
      id: 1,
      title: 'Getting Started Guide',
      description: 'Complete guide to setting up your corporate account and making your first shipment',
      category: 'getting-started',
      type: 'guide',
      icon: BookOpen,
      estimatedTime: '10 min read',
      difficulty: 'Beginner',
      isNew: true,
      isPopular: true,
      views: 1250,
      rating: 4.8,
      color: 'blue',
      content: 'This comprehensive guide will walk you through setting up your corporate account, understanding pricing, and creating your first shipment.'
    },
    {
      id: 2,
      title: 'How to Create a Shipment',
      description: 'Step-by-step tutorial on creating and managing shipments through the portal',
      category: 'booking',
      type: 'tutorial',
      icon: Video,
      estimatedTime: '5 min video',
      difficulty: 'Beginner',
      isNew: false,
      isPopular: true,
      views: 2100,
      rating: 4.9,
      color: 'green',
      content: 'Learn how to create shipments, add recipients, and track your packages from pickup to delivery.'
    },
    {
      id: 3,
      title: 'Understanding Pricing & Zones',
      description: 'Detailed explanation of our pricing structure and service zones',
      category: 'billing',
      type: 'guide',
      icon: FileText,
      estimatedTime: '8 min read',
      difficulty: 'Intermediate',
      isNew: false,
      isPopular: false,
      views: 890,
      rating: 4.6,
      color: 'purple',
      content: 'Understand how our pricing works, what factors affect costs, and how to optimize your shipping expenses.'
    },
    {
      id: 4,
      title: 'Billing & Settlement Process',
      description: 'Everything you need to know about invoices, payments, and settlement cycles',
      category: 'billing',
      type: 'guide',
      icon: File,
      estimatedTime: '6 min read',
      difficulty: 'Intermediate',
      isNew: false,
      isPopular: false,
      views: 750,
      rating: 4.5,
      color: 'orange',
      content: 'Learn about billing cycles, payment methods, invoice generation, and settlement processes.'
    },
    {
      id: 5,
      title: 'Tracking & Monitoring Shipments',
      description: 'How to track shipments, set up notifications, and monitor delivery status',
      category: 'booking',
      type: 'tutorial',
      icon: Video,
      estimatedTime: '4 min video',
      difficulty: 'Beginner',
      isNew: false,
      isPopular: true,
      views: 1800,
      rating: 4.7,
      color: 'blue',
      content: 'Master the tracking system to monitor your shipments in real-time and keep your customers informed.'
    },
    {
      id: 6,
      title: 'Corporate Account Management',
      description: 'Managing your company profile, users, and account settings',
      category: 'getting-started',
      type: 'guide',
      icon: Users,
      estimatedTime: '7 min read',
      difficulty: 'Intermediate',
      isNew: false,
      isPopular: false,
      views: 650,
      rating: 4.4,
      color: 'purple',
      content: 'Learn how to manage your corporate account, add team members, and configure account settings.'
    }
  ];

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: MessageSquare,
      action: 'contact',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Schedule Call',
      description: 'Book a call with our experts',
      icon: Phone,
      action: 'call',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: Mail,
      action: 'email',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const filteredResources = helpResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceClick = (resource: any) => {
    // In a real application, this would open the resource content
    console.log('Opening resource:', resource.title);
  };

  const handleQuickAction = (action: string) => {
    // In a real application, this would trigger the appropriate action
    console.log('Quick action:', action);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'tutorial': return Play;
      case 'guide': return BookOpen;
      default: return FileText;
    }
  };

  const getColorConfig = (color: string) => {
    // Minimalistic color scheme - all resources use the same neutral styling
    return {
      bg: 'bg-white/50 backdrop-blur-sm',
      iconBg: 'bg-gray-100/80',
      iconColor: 'text-gray-600',
      border: 'border-gray-200/60',
      hoverBg: 'hover:bg-white/60 hover:border-gray-300/60'
    };
  };

  const stats = [
    { label: 'Total Resources', value: helpResources.length, icon: BookOpen },
    { label: 'Popular Guides', value: helpResources.filter(r => r.isPopular).length, icon: Star },
    { label: 'Video Tutorials', value: helpResources.filter(r => r.type === 'tutorial').length, icon: Video },
    { label: 'Avg Rating', value: '4.7', icon: ThumbsUp }
  ];

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Find guides, tutorials, and support to help you succeed</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-white/50 border-gray-200 text-gray-700">
            <HelpCircle className="h-3 w-3 mr-1" />
            Support Center
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/30 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 hover:bg-white/60 hover:border-gray-300/60 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100/60 rounded-lg">
                <stat.icon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Search */}
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search help articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base bg-white/50 border-gray-200/60 focus:bg-white/80 focus:border-blue-300/60"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="w-full justify-start bg-white/50 border-gray-200/60 text-gray-700 hover:bg-white/70 hover:border-gray-300/60 hover:text-gray-800 h-10"
              variant="outline"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 h-8 ${
              selectedCategory === category.id 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white/50 border-gray-200/60 text-gray-700 hover:bg-white/70 hover:border-gray-300/60 hover:text-gray-800'
            }`}
          >
            <category.icon className="h-3 w-3" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide">
        {/* Featured Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-gray-100/60 rounded-lg">
              <Lightbulb className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Featured Resources</h2>
          </div>
          
          <div className="space-y-3">
            {filteredResources.slice(0, 4).map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              const config = getColorConfig(resource.color);
              return (
                <div key={resource.id} className={`rounded-lg border ${config.border} ${config.bg} hover:bg-white/60 hover:border-gray-300/60 p-4 transition-all duration-200 cursor-pointer group`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.iconBg}`}>
                      <TypeIcon className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-gray-100/60 border-gray-200/60 text-gray-600 text-xs px-1.5 py-0.5">
                              {resource.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {resource.estimatedTime}
                            </div>
                            {resource.isPopular && (
                              <Badge variant="outline" className="bg-white/50 border-gray-200/60 text-gray-600 text-xs px-1.5 py-0.5">
                                <Star className="h-2 w-2 mr-1" />
                                Popular
                              </Badge>
                            )}
                            {resource.isNew && (
                              <Badge variant="outline" className="bg-white/50 border-gray-200/60 text-gray-600 text-xs px-1.5 py-0.5">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResourceClick(resource)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - All Resources & Support */}
        <div className="space-y-6">
          {/* All Resources */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gray-100/60 rounded-lg">
                <BookOpen className="h-3 w-3 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">All Resources</h3>
            </div>
            <div className="space-y-2">
              {filteredResources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <div key={resource.id} className="flex items-center space-x-2 p-2 bg-white/30 border border-gray-200/50 rounded hover:bg-white/60 hover:border-gray-300/60 transition-all duration-200 cursor-pointer group">
                    <div className="flex-shrink-0">
                      <TypeIcon className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                          {resource.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {resource.isPopular && <Star className="h-2 w-2 text-gray-400" />}
                          {resource.isNew && <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-gray-100/60 border-gray-200/60 text-gray-500 text-xs px-1 py-0.5">
                          {resource.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-2 w-2" />
                          {resource.estimatedTime}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white/30 border border-gray-200/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-100/60 rounded-lg">
                <Headphones className="h-3 w-3 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Our support team is here to help you succeed.</p>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Live Chat
              </Button>
              <Button variant="outline" className="w-full bg-white/50 border-gray-200/60 text-gray-700 hover:bg-white/70 hover:border-gray-300/60 hover:text-gray-800 h-8 text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Call Support
              </Button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="h-3 w-3" />
                <span>support@ocl.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpResources;
