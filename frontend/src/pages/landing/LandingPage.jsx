import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import {
  ShieldCheck, ArrowRight, Search, Users, UserCog, Shield,
  MapPin, Clock, CheckCircle2, FileText, Bell, BarChart3,
  Zap, Building2, ArrowUpRight, ChevronRight,
} from 'lucide-react';

const ROLE_CARDS = [
  {
    role: 'Citizen',
    icon: Users,
    color: 'blue',
    accent: '#1D4ED8',
    description: 'Report civic issues, track progress, and receive updates on complaints in your area.',
    features: ['Submit complaints with photos', 'Track status in real-time', 'Get notified on updates'],
    href: '/register',
    cta: 'Register as Citizen',
  },
  {
    role: 'Officer',
    icon: Shield,
    color: 'teal',
    accent: '#0F766E',
    description: 'View assigned complaints, update status, add remarks, and upload resolution evidence.',
    features: ['Manage assigned complaints', 'Update status & remarks', 'Upload resolution evidence'],
    href: '/login',
    cta: 'Officer Login',
  },
  {
    role: 'Department Head',
    icon: UserCog,
    color: 'purple',
    accent: '#7C3AED',
    description: 'Oversee department complaints, assign officers, and monitor resolution progress.',
    features: ['Assign officers to complaints', 'Monitor department workload', 'Track resolution rates'],
    href: '/login',
    cta: 'Department Head Login',
  },
  {
    role: 'Super Admin',
    icon: Building2,
    color: 'orange',
    accent: '#EA580C',
    description: 'Manage users, departments, and system-wide analytics across the entire platform.',
    features: ['Manage all users & officers', 'Create & edit departments', 'View system analytics'],
    href: '/login',
    cta: 'Admin Login',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Classification',
    description: 'Complaints are automatically categorized, routed to departments, and prioritized by AI.',
    color: 'text-civic-accent',
    bg: 'bg-sky-50',
  },
  {
    icon: FileText,
    title: 'Complete Complaint Tracking',
    description: 'Every complaint maintains a full status history from submission to resolution.',
    color: 'text-civic-blue',
    bg: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'Citizens, officers, and admins stay informed at every stage of the process.',
    color: 'text-civic-teal',
    bg: 'bg-teal-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Administrators get comprehensive analytics on complaints, departments, and officer workload.',
    color: 'text-status-progress',
    bg: 'bg-purple-50',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control',
    description: 'Secure, role-specific access ensures every user sees only what they need.',
    color: 'text-status-pending',
    bg: 'bg-orange-50',
  },
  {
    icon: MapPin,
    title: 'Location-Based Reporting',
    description: 'Complaints are tagged with location data for precise issue tracking.',
    color: 'text-status-resolved',
    bg: 'bg-green-50',
  },
];

const WORKFLOW_STEPS = [
  { step: 'Report', icon: FileText, description: 'Citizen submits a complaint with details and evidence' },
  { step: 'Classify', icon: Zap, description: 'AI determines category, department, and priority' },
  { step: 'Assign', icon: UserCog, description: 'Department Head assigns the complaint to an officer' },
  { step: 'Resolve', icon: CheckCircle2, description: 'Officer investigates, updates status, and resolves' },
  { step: 'Track', icon: BarChart3, description: 'Citizen and admin track the complete journey' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-civic-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-civic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary transition-colors">
                How It Works
              </a>
              <a href="#roles" className="px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary transition-colors">
                Roles
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/track">
                <Button variant="ghost" size="sm" leftIcon={<Search size={16} />} className="hidden sm:inline-flex">
                  Track Complaint
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="sm">Sign in</Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={16} />}>
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-civic-bg to-civic-bg" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-civic-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-civic-teal/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <ShieldCheck size={15} className="text-civic-blue" />
              <span className="text-sm font-medium text-civic-blue">AI-Powered Civic Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-civic-text-primary tracking-tight leading-[1.1]">
              Report. Resolve.
              <br />
              <span className="text-civic-blue">Improve Your City.</span>
            </h1>
            <p className="mt-6 text-lg text-civic-text-secondary leading-relaxed max-w-2xl mx-auto">
              Smart Civic is an AI-powered civic issue management platform that connects citizens,
              field officers, and administrators to resolve community problems efficiently and transparently.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />} fullWidth>
                  Report an Issue
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="secondary" size="lg" leftIcon={<Search size={18} />} fullWidth>
                  Track Complaint
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-civic-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-status-resolved" />
                <span>No technical knowledge needed</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CheckCircle2 size={16} className="text-status-resolved" />
                <span>Real-time status updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-y border-civic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '9', label: 'Departments', icon: Building2 },
              { value: '4', label: 'User Roles', icon: Users },
              { value: '10+', label: 'Issue Categories', icon: FileText },
              { value: 'AI', label: 'Smart Classification', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-civic-hover mb-2">
                  <stat.icon size={20} className="text-civic-blue" />
                </div>
                <p className="text-2xl font-bold text-civic-text-primary">{stat.value}</p>
                <p className="text-sm text-civic-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section id="roles" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-civic-text-primary">
              Built for Every Role
            </h2>
            <p className="mt-4 text-lg text-civic-text-secondary">
              Whether you're a citizen reporting an issue or an administrator managing the system,
              Smart Civic provides a tailored experience for each role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.role}
                  to={card.href}
                  className="group card-base p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  style={{ borderTopColor: card.accent, borderTopWidth: '3px' }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${card.accent}15` }}
                  >
                    <Icon size={24} style={{ color: card.accent }} />
                  </div>
                  <h3 className="text-lg font-semibold text-civic-text-primary mb-2">
                    {card.role}
                  </h3>
                  <p className="text-sm text-civic-text-secondary mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  <ul className="space-y-2 mb-5">
                    {card.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-civic-text-primary">
                        <CheckCircle2 size={15} className="text-status-resolved flex-shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                    style={{ color: card.accent }}
                  >
                    {card.cta}
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white border-y border-civic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-civic-text-primary">
              Everything You Need to Manage Civic Issues
            </h2>
            <p className="mt-4 text-lg text-civic-text-secondary">
              From first report to final resolution, Smart Civic streamlines the entire process
              with powerful features designed for transparency and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card-base p-6 hover:shadow-card-hover transition-shadow duration-300">
                  <div className={`w-11 h-11 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={feature.color} />
                  </div>
                  <h3 className="text-base font-semibold text-civic-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-civic-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-civic-text-primary">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-civic-text-secondary">
              A simple, transparent workflow from complaint submission to resolution.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-civic-border" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative">
              {WORKFLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center relative">
                    <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-civic-border flex items-center justify-center mb-4 transition-all duration-300 hover:border-civic-blue hover:shadow-card-hover">
                      <Icon size={24} className="text-civic-blue" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-civic-blue text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-civic-text-primary mb-1.5">
                      {step.step}
                    </h3>
                    <p className="text-sm text-civic-text-secondary leading-relaxed max-w-[200px]">
                      {step.description}
                    </p>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <ChevronRight size={20} className="text-civic-muted absolute top-12 -right-2 hidden lg:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-white border-t border-civic-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-civic-blue px-8 py-14 lg:px-16 lg:py-20 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-civic-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Improve Your City?
              </h2>
              <p className="text-white/85 text-lg max-w-xl mx-auto mb-8">
                Join Smart Civic today and be part of a transparent, efficient civic issue
                management system that works for everyone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="bg-white text-civic-blue hover:bg-blue-50 border-0" rightIcon={<ArrowRight size={18} />} fullWidth>
                    Report an Issue
                  </Button>
                </Link>
                <Link to="/track">
                  <Button size="lg" className="bg-civic-blue-hover text-white border border-white/30 hover:bg-blue-900" leftIcon={<Search size={18} />} fullWidth>
                    Track a Complaint
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-civic-bg border-t border-civic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 text-sm text-civic-text-secondary max-w-md leading-relaxed">
                Smart Civic is an AI-powered civic issue and complaint management system
                designed to make cities better by connecting citizens with their local government.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-civic-text-primary mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">How It Works</a></li>
                <li><a href="#roles" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">User Roles</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-civic-text-primary mb-3">Get Started</h4>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">Register</Link></li>
                <li><Link to="/login" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">Sign in</Link></li>
                <li><Link to="/track" className="text-sm text-civic-text-secondary hover:text-civic-blue transition-colors">Track Complaint</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-civic-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-civic-muted">Smart Civic — AI-Powered Civic Issue Management</p>
            <div className="flex items-center gap-2 text-sm text-civic-muted">
              <Clock size={14} />
              <span>Built for better communities</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
