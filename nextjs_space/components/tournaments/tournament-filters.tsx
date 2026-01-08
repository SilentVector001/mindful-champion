// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TournamentFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  states?: string[];
}

export interface FilterState {
  search: string;
  state: string;
  skillLevel: string;
  format: string;
  startDate: string;
  endDate: string;
  sortBy: string;
}

const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'];
const formats = ['SINGLES', 'DOUBLES', 'MIXED_DOUBLES'];
const sortOptions = [
  { value: 'startDate', label: 'Start Date' },
  { value: 'name', label: 'Name' },
  { value: 'prizePool', label: 'Prize Pool' },
  { value: 'currentRegistrations', label: 'Popularity' },
];

export function TournamentFilters({ onFilterChange, states = [] }: TournamentFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    state: '',
    skillLevel: '',
    format: '',
    startDate: '',
    endDate: '',
    sortBy: 'startDate',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter(v => v !== '' && v !== 'startDate').length;
    setActiveFilterCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // Convert "all" to empty string for state, skillLevel, and format filters
    const actualValue = (value === 'all') ? '' : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      state: '',
      skillLevel: '',
      format: '',
      startDate: '',
      endDate: '',
      sortBy: 'startDate',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const clearFilter = (key: keyof FilterState) => {
    handleFilterChange(key, '');
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-xl">Filter Tournaments</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="bg-teal-600">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${!isExpanded ? 'hidden lg:block' : ''}`}>
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </label>
          <div className="relative">
            <Input
              placeholder="Search tournaments, cities, or states..."
              value={filters?.search ?? ''}
              onChange={(e) => handleFilterChange('search', e?.target?.value ?? '')}
              className="pr-8"
            />
            {filters?.search && (
              <button
                onClick={() => clearFilter('search')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            State
          </label>
          <Select value={filters?.state || 'all'} onValueChange={(value) => handleFilterChange('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {(states ?? []).filter(state => state && state.trim() !== '').map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skill Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Skill Level
          </label>
          <Select value={filters?.skillLevel || 'all'} onValueChange={(value) => handleFilterChange('skillLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {skillLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Format
          </label>
          <Select value={filters?.format || 'all'} onValueChange={(value) => handleFilterChange('format', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              {formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format?.replace('_', ' ') ?? ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters?.startDate ?? ''}
              onChange={(e) => handleFilterChange('startDate', e?.target?.value ?? '')}
              placeholder="From"
            />
            <Input
              type="date"
              value={filters?.endDate ?? ''}
              onChange={(e) => handleFilterChange('endDate', e?.target?.value ?? '')}
              placeholder="To"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort By</label>
          <Select value={filters?.sortBy ?? 'startDate'} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option?.value ?? ''} value={option?.value ?? ''}>
                  {option?.label ?? ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t"
          >
            <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters?.search && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => clearFilter('search')}>
                  Search: {filters.search}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters?.state && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => clearFilter('state')}>
                  State: {filters.state}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters?.skillLevel && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => clearFilter('skillLevel')}>
                  Level: {filters.skillLevel}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters?.format && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => clearFilter('format')}>
                  Format: {filters.format?.replace('_', ' ') ?? ''}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
