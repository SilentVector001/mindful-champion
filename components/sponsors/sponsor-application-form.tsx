
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Building2, Mail, Phone, User, Globe, Briefcase, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SponsorApplicationFormProps {
  onBack: () => void;
}

export default function SponsorApplicationForm({ onBack }: SponsorApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    contactPerson: '',
    industry: '',
    description: '',
    yearsInBusiness: '',
    interestedTier: '',
    marketingGoals: '',
    targetAudience: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: '',
    },
    proposedProducts: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/sponsors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          title: 'Application Submitted! 🎉',
          description: 'We\'ll review your application and get back to you within 2-3 business days.',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: data.error || 'Failed to submit application',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="text-center shadow-2xl">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Application Submitted!</CardTitle>
              <CardDescription className="text-lg mt-4">
                Thank you for your interest in becoming a Mindful Champion sponsor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription className="text-left">
                  <strong>What happens next?</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Our partnerships team will review your application</li>
                    <li>We'll contact you within 2-3 business days</li>
                    <li>If approved, we'll guide you through the onboarding process</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <p className="text-gray-600">
                We've sent a confirmation email to <strong>{formData.email}</strong>
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Program Details
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl">Sponsor Application</CardTitle>
              <CardDescription className="text-lg">
                Tell us about your company and partnership goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        required
                        placeholder="Acme Sports Equipment"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleChange('website', e.target.value)}
                          className="pl-10"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          className="pl-10"
                          placeholder="partnerships@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="pl-10"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Primary Contact Person *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => handleChange('contactPerson', e.target.value)}
                        required
                        className="pl-10"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Business Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipment">Sports Equipment</SelectItem>
                          <SelectItem value="apparel">Apparel & Footwear</SelectItem>
                          <SelectItem value="nutrition">Nutrition & Supplements</SelectItem>
                          <SelectItem value="technology">Technology & Wearables</SelectItem>
                          <SelectItem value="training">Training & Coaching</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsInBusiness">Years in Business</Label>
                      <Input
                        id="yearsInBusiness"
                        type="number"
                        min="0"
                        value={formData.yearsInBusiness}
                        onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                      rows={4}
                      placeholder="Tell us about your company, products, and what makes you unique..."
                    />
                  </div>
                </div>

                {/* Partnership Interest */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Partnership Interest</h3>

                  <div className="space-y-2">
                    <Label htmlFor="interestedTier">Preferred Partnership Tier *</Label>
                    <Select value={formData.interestedTier} onValueChange={(value) => handleChange('interestedTier', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze - $500/month</SelectItem>
                        <SelectItem value="silver">Silver - $1,500/month</SelectItem>
                        <SelectItem value="gold">Gold - $3,500/month</SelectItem>
                        <SelectItem value="platinum">Platinum - Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proposedProducts">Proposed Products/Services</Label>
                    <Textarea
                      id="proposedProducts"
                      value={formData.proposedProducts}
                      onChange={(e) => handleChange('proposedProducts', e.target.value)}
                      rows={3}
                      placeholder="List the products or services you'd like to feature as rewards (e.g., paddles, training equipment, apparel, etc.)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketingGoals">Marketing Goals</Label>
                    <Textarea
                      id="marketingGoals"
                      value={formData.marketingGoals}
                      onChange={(e) => handleChange('marketingGoals', e.target.value)}
                      rows={3}
                      placeholder="What do you hope to achieve through this partnership? (e.g., brand awareness, customer acquisition, etc.)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => handleChange('targetAudience', e.target.value)}
                      rows={2}
                      placeholder="Describe your ideal customer within the pickleball community"
                    />
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Social Media Presence (Optional)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                        placeholder="@yourcompany"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        placeholder="@yourcompany"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                        placeholder="facebook.com/yourcompany"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
