'use client';

import { useRouter } from 'next/navigation';
import { Search, MapPin, CalendarDays, BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';

export function HomeSearchBar() {
  const router = useRouter();
  const [where, setWhere] = useState('');
  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('food_truck_spot');

  function submit() {
    const params = new URLSearchParams();
    if (where) params.set('q', where);
    if (when) params.set('when', when);
    if (what) params.set('category', what);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="rounded-full border bg-white p-2 shadow-sm">
      <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
        <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-neutral-50">
          <MapPin className="h-4 w-4 text-neutral-500" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold">Where</div>
            <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Search city, neighborhood, zip" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-neutral-50">
          <CalendarDays className="h-4 w-4 text-neutral-500" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold">When</div>
            <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Any week or lease window" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-neutral-50">
          <BriefcaseBusiness className="h-4 w-4 text-neutral-500" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold">What</div>
            <select value={what} onChange={(e) => setWhat(e.target.value)} className="w-full bg-transparent text-sm outline-none">
              <option value="food_truck_spot">Food truck spot</option>
              <option value="pop_up_retail">Pop-up retail</option>
              <option value="production_space">Production space</option>
              <option value="photo_studio">Photo studio</option>
              <option value="event_space">Event space</option>
            </select>
          </div>
        </label>

        <button onClick={submit} className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-white hover:bg-rose-600">
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
