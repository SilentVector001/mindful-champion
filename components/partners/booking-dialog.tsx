
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, DollarSign, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BookingDialog({
  partner,
  service,
  user,
  isOpen,
  onClose,
  onSuccess,
}: {
  partner: any;
  service: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<'date' | 'details' | 'confirm' | 'success'>('date');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate time slots (9 AM - 8 PM in 30-minute intervals)
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const m = minute === 0 ? '00' : minute;
      timeSlots.push(`${h}:${m} ${ampm}`);
    }
  }

  const handleSubmit = async () => {
    if (!date || !time) {
      toast.error('Please select a date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partners/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: partner.id,
          serviceId: service.id,
          serviceType: service.serviceType,
          serviceName: service.name,
          sessionDate: date,
          sessionTime: time,
          duration: service.duration,
          amount: service.price,
          userNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setStep('success');
      
      toast.success('Booking request sent!');
      
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const platformFee = Math.round(service.price * 0.15);
  const totalCost = service.price + platformFee;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book a Session with {partner.name}</DialogTitle>
        </DialogHeader>

        {step === 'date' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Service Summary */}
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${(service.price / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Date Selection */}
            <div>
              <Label>Select a Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border mt-2"
              />
            </div>

            {/* Time Selection */}
            {date && (
              <div>
                <Label>Select a Time</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTime(slot)}
                      className={time === slot ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {date && time && (
              <Button
                onClick={() => setStep('details')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continue
              </Button>
            )}
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Selected DateTime */}
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">
                  {date && format(date, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">{time}</span>
              </div>
            </Card>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Tell the coach about your goals, experience level, or any specific areas you'd like to focus on..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('date')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {/* Booking Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
                <Card className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Coach</span>
                    <span className="font-semibold">{partner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service</span>
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                    <span className="font-semibold">
                      {date && format(date, 'MMM d, yyyy')} at {time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-semibold">{service.duration} min</span>
                  </div>
                </Card>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
                <Card className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Session fee</span>
                    <span>${(service.price / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Platform fee</span>
                    <span>${(platformFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-purple-600">${(totalCost / 100).toFixed(2)}</span>
                  </div>
                </Card>
              </div>

              {/* Important Notice */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Your booking request will be sent to the coach for approval. 
                  You'll receive a confirmation email once they accept. Payment will be processed after confirmation.
                </p>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('details')}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Booking Request
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Request Sent!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {partner.name} will review your request and get back to you soon.
            </p>
            <Button onClick={onSuccess} className="bg-purple-600 hover:bg-purple-700">
              Done
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
