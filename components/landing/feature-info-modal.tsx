'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export type FeatureInfo = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  image?: string;
  benefits: string[];
  details: string[];
  redirectUrl: string;
};

type FeatureInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureInfo | null;
};

export default function FeatureInfoModal({ isOpen, onClose, feature }: FeatureInfoModalProps) {
  if (!feature) return null;

  const IconComponent = feature.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">{feature.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300 pt-2">
            {feature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Image */}
          {feature.image && (
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img 
                src={feature.image} 
                alt={feature.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          )}

          {/* Key Benefits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Key Benefits
            </h3>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What You'll Get
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {feature.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ready to get started with <strong>{feature.title}</strong>?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Maybe Later
              </Button>
              <Link href={`/auth/signup?redirect=${encodeURIComponent(feature.redirectUrl)}`} className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign Up to Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              No credit card required • Full access • Cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
