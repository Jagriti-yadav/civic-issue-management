import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-civic-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-civic-accent rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="h-10 w-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <span className="text-lg font-bold tracking-tight">SmartCivic</span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Report. Resolve. Improve Your City.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              A unified platform connecting citizens, field officers, and administrators
              to build better communities through transparent civic issue management.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <div>
              <p className="text-2xl font-bold text-white">AI-Powered</p>
              <p>Smart Classification</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">4 Roles</p>
              <p>Unified Workflow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-6 border-b border-civic-border">
          <Link to="/" className="flex items-center gap-2 text-civic-text-secondary hover:text-civic-text-primary transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {title && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-civic-text-primary">{title}</h1>
                {subtitle && (
                  <p className="mt-2 text-civic-text-secondary">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
