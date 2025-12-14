'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePickerProps {
  times: string[];
  onChange: (times: string[]) => void;
}

export default function TimePicker({ times, onChange }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const addTime = () => {
    // Convert to 24-hour format
    let hour = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hour !== 12) hour += 12;
    if (selectedPeriod === 'AM' && hour === 12) hour = 0;

    const time = `${String(hour).padStart(2, '0')}:${selectedMinute}`;
    
    if (!times.includes(time)) {
      onChange([...times, time].sort());
    }
  };

  const removeTime = (time: string) => {
    onChange(times.filter(t => t !== time));
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <div className="space-y-4">
      {/* Selected Times */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {times.map((time) => (
            <motion.div
              key={time}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Card className="px-3 py-2 flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <span className="text-sm font-medium text-teal-700">
                  {formatTime(time)}
                </span>
                <button
                  onClick={() => removeTime(time)}
                  className="text-teal-600 hover:text-teal-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Time */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-600">Hour</label>
          <Select value={selectedHour} onValueChange={setSelectedHour}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hours.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-600">Minute</label>
          <Select value={selectedMinute} onValueChange={setSelectedMinute}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {minutes.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-xs text-gray-600">Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={addTime}
          size="icon"
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
