'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MAJOR_CITIES = [
  'Austin, TX', 'Nashville, TN', 'Portland, OR', 'Denver, CO', 'Miami, FL',
  'Chicago, IL', 'Seattle, WA', 'New York, NY', 'Los Angeles, CA', 'Dallas, TX',
  'Phoenix, AZ', 'Atlanta, GA', 'Houston, TX', 'San Francisco, CA', 'Boston, MA',
  'Las Vegas, NV', 'San Diego, CA', 'Philadelphia, PA', 'Charlotte, NC', 'Detroit, MI',
  'Minneapolis, MN', 'Tampa, FL', 'Orlando, FL', 'Baltimore, MD', 'Salt Lake City, UT',
];

const SIZE_OPTIONS = [
  { value: '', label: 'Any size' },
  { value: '0-500', label: 'Under 500 sqft' },
  { value: '500-1000', label: '500–1,000 sqft' },
  { value: '1000-2500', label: '1,000–2,500 sqft' },
  { value: '2500-99999', label: '2,500+ sqft' },
];

interface SearchBarProps {
  defaultCity?: string;
  defaultStart?: string;
  defaultEnd?: string;
  defaultSize?: string;
  variant?: 'hero' | 'compact';
}

export function SearchBar({
  defaultCity = '',
  defaultStart = '',
  defaultEnd = '',
  defaultSize = '',
  variant = 'hero',
}: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [size, setSize] = useState(defaultSize);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggRef.current && !suggRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCityChange = (val: string) => {
    setCity(val);
    if (val.length > 0) {
      const filtered = MAJOR_CITIES.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (size) params.set('size', size);
    router.push(`/spaces?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white border border-gray-200 rounded-xl shadow-sm p-2">
        <div className="relative flex-1" ref={suggRef}>
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where?"
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden mt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setCity(s); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none border-l border-gray-200"
        />
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none border-l border-gray-200"
        />
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none border-l border-gray-200 bg-white"
        >
          {SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Search
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-stretch bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
        {/* Location */}
        <div className="relative flex-1 border-b md:border-b-0 md:border-r border-gray-200" ref={suggRef}>
          <div className="px-6 py-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Where are you looking?"
              className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden mt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setCity(s); setShowSuggestions(false); }}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-400 mr-2">📍</span>{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex flex-1 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex-1 px-4 py-4 border-r border-gray-100">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Check in
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex-1 px-4 py-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Check out
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Size + Search */}
        <div className="flex items-stretch">
          <div className="px-4 py-4 border-r border-gray-100 flex-1 md:flex-none md:w-40">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full text-sm text-gray-800 focus:outline-none bg-transparent"
            >
              {SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-r-2xl transition-colors flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
