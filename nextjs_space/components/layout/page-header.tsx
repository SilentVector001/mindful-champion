'use client';

import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backLabel?: string;
  backHref?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export function PageHeader({
  title,
  subtitle,
  showBackButton,
  backLabel = 'Back',
  backHref,
  breadcrumbs,
  actions,
  className,
  variant = 'default'
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  // Compact variant - minimal spacing
  if (variant === 'compact') {
    return (
      <div className={cn("border-b border-slate-200 bg-white", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-3 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {backLabel}
            </Button>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Hero variant - larger, more prominent
  if (variant === 'hero') {
    return (
      <div className={cn("border-b border-slate-200 bg-gradient-to-br from-white to-slate-50", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {backLabel}
            </Button>
          )}
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-slate-400">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-slate-900 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-slate-900 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-3 text-lg text-slate-600 max-w-3xl">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3 ml-6">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("border-b border-slate-200 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button or breadcrumbs */}
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {backLabel}
          </Button>
        )}
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-slate-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-slate-900 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-900 font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title and actions */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-slate-600">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3 ml-6">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
