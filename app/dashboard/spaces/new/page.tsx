'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SPACE_TYPES = [
  { value: 'parking_lot', label: 'Parking Lot', icon: 'P', desc: 'Paved or gravel lot' },
  { value: 'storefront', label: 'Storefront', icon: 'S', desc: 'Retail-ready space' },
  { value: 'vacant_land', label: 'Vacant Land', icon: 'L', desc: 'Open, undeveloped lot' },
  { value: 'warehouse', label: 'Warehouse', icon: 'W', desc: 'Indoor commercial space' },
  { value: 'other', label: 'Other', icon: 'O', desc: 'Something unique' },
];

const AMENITY_OPTIONS = [
  { key: 'electricity', label: 'Electricity / Power' },
  { key: 'water_access', label: 'Water Access' },
  { key: 'restrooms', label: 'Restrooms' },
  { key: 'parking', label: 'Parking' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'garbage_access', label: 'Garbage / Trash' },
  { key: 'storage', label: 'Storage' },
  { key: 'security_camera', label: 'Security Camera' },
  { key: 'covered', label: 'Covered / Indoor' },
  { key: 'high_traffic', label: 'High Traffic Area' },
];

const PREMADE_RULES = [
  'No alcohol sales',
  'Food trucks only',
  'Dessert vendors only',
  'Closed after 10PM',
  '5 parking spaces max',
  'Insurance required',
  'Permits required',
  'No amplified music',
  'Vendor must provide own power',
  'No open flames',
];

interface ImagePreview {
  file: File;
  preview: string;
}

interface RulesState {
  required: string[];
  prohibited: string[];
  preferred: string[];
  custom: string;
}

interface FormState {
  space_type: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  size_sqft: string;
  operating_hours: string;
  price_per_day: string;
  price_per_month: string;
  instant_book: boolean;
  amenities: Record<string, boolean>;
  images: ImagePreview[];
  rules: RulesState;
}

const STEP_LABELS = ['Basics', 'Location', 'Amenities', 'Contract'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ' +
              (i + 1 < current
                ? 'bg-rose-600 text-white'
                : i + 1 === current
                ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                : 'bg-gray-100 text-gray-400')}
          >
            {i + 1 < current ? '✓' : String(i + 1)}
          </div>
          {i < total - 1 && (
            <div className={'h-0.5 w-8 ' + (i + 1 < current ? 'bg-rose-600' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">What type of space are you listing?</h2>
        <p className="text-gray-500">Choose the category that best describes your property.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SPACE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => update({ space_type: t.value })}
            className={'p-4 rounded-2xl border-2 text-left transition-all ' +
              (form.space_type === t.value ? 'border-rose-600 bg-rose-50' : 'border-gray-200 hover:border-gray-400 bg-white')}
          >
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold mb-3 ' +
              (form.space_type === t.value ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500')}>
              {t.icon}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Listing title <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g., Corner Lot - Perfect for Food Trucks"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={4}
            placeholder="Describe your space - what makes it unique, nearby amenities, access details..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Location and details</h2>
        <p className="text-gray-500">Help renters find and understand your space.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Street Address <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="123 Main Street"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">City <span className="text-rose-600">*</span></label>
            <input type="text" value={form.city} onChange={(e) => update({ city: e.target.value })} placeholder="Austin"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State <span className="text-rose-600">*</span></label>
            <input type="text" value={form.state} onChange={(e) => update({ state: e.target.value })} placeholder="TX" maxLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP <span className="text-rose-600">*</span></label>
            <input type="text" value={form.zip_code} onChange={(e) => update({ zip_code: e.target.value })} placeholder="78701" maxLength={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Size (sqft)</label>
            <input type="number" value={form.size_sqft} onChange={(e) => update({ size_sqft: e.target.value })} placeholder="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Hours</label>
            <input type="text" value={form.operating_hours} onChange={(e) => update({ operating_hours: e.target.value })} placeholder="Mon-Sat 7AM-10PM"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Day ($)</label>
            <input type="number" value={form.price_per_day} onChange={(e) => update({ price_per_day: e.target.value })} placeholder="150" step="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Month ($) <span className="text-rose-600">*</span></label>
            <input type="number" value={form.price_per_month} onChange={(e) => update({ price_per_month: e.target.value })} placeholder="2500" step="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
        <div
          onClick={() => update({ instant_book: !form.instant_book })}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className={'w-12 h-6 rounded-full transition-colors ' + (form.instant_book ? 'bg-rose-600' : 'bg-gray-300')}>
            <div className={'w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ' + (form.instant_book ? 'translate-x-6' : 'translate-x-0.5')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Allow Instant Book</p>
            <p className="text-xs text-gray-500">Vendors can book without your approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAmenity = (key: string) => {
    update({ amenities: { ...form.amenities, [key]: !form.amenities[key] } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    update({ images: [...form.images, ...newPreviews] });
  };

  const removeImage = (idx: number) => {
    const updated = [...form.images];
    URL.revokeObjectURL(updated[idx].preview);
    updated.splice(idx, 1);
    update({ images: updated });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Amenities and Photos</h2>
        <p className="text-gray-500">Tell renters what you offer and show off your space.</p>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Available amenities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => toggleAmenity(a.key)}
              className={'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ' +
                (form.amenities[a.key] ? 'border-rose-600 bg-rose-50' : 'border-gray-200 hover:border-gray-400 bg-white')}
            >
              <div className={'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                (form.amenities[a.key] ? 'border-rose-600 bg-rose-600' : 'border-gray-300')}>
                {form.amenities[a.key] && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Photos</h3>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors"
        >
          <div className="text-4xl mb-3">+</div>
          <p className="font-semibold text-gray-700">Click to upload photos</p>
          <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        {form.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img.preview} alt={'Preview ' + (idx + 1)} className="w-full h-28 object-cover rounded-xl" />
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">Primary</div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  const [contractVisible, setContractVisible] = useState(false);
  const [customRule, setCustomRule] = useState('');

  const addRule = (bucket: keyof RulesState, rule: string) => {
    if (bucket === 'custom') return;
    const existing = form.rules[bucket as 'required' | 'prohibited' | 'preferred'];
    if (!existing.includes(rule)) {
      update({ rules: { ...form.rules, [bucket]: [...existing, rule] } });
    }
  };

  const removeRule = (bucket: 'required' | 'prohibited' | 'preferred', rule: string) => {
    update({ rules: { ...form.rules, [bucket]: form.rules[bucket].filter((r) => r !== rule) } });
  };

  const addCustom = () => {
    if (customRule.trim()) {
      addRule('required', customRule.trim());
      setCustomRule('');
    }
  };

  const allRules = [...form.rules.required, ...form.rules.prohibited, ...form.rules.preferred];

  const contractText = [
    'COMMERCIAL SPACE LICENSE AGREEMENT',
    '',
    'This Agreement is between the Property Owner ("Licensor") and the Vendor ("Licensee").',
    '',
    '1. PERMITTED USE',
    'Licensee may use the space for lawful commercial activities per local zoning.',
    '',
    '2. REQUIRED CONDITIONS',
    ...(form.rules.required.length > 0 ? form.rules.required.map((r) => '   - ' + r) : ['   - None specified']),
    '',
    '3. PROHIBITED ACTIVITIES',
    ...(form.rules.prohibited.length > 0 ? form.rules.prohibited.map((r) => '   - ' + r) : ['   - None specified']),
    '',
    '4. PREFERRED PRACTICES',
    ...(form.rules.preferred.length > 0 ? form.rules.preferred.map((r) => '   - ' + r) : ['   - None specified']),
    '',
    '5. TERM',
    'Effective for the period in the booking confirmation. Either party may terminate with 7 days notice.',
    '',
    '6. LIABILITY',
    'Licensee assumes full responsibility for operations and must maintain appropriate insurance.',
    '',
    '7. COMPLIANCE',
    'Licensee is responsible for all necessary permits and licenses.',
    '',
    'By booking, both parties agree to this Agreement.',
  ].join('\n');

  const BUCKETS: { key: 'required' | 'prohibited' | 'preferred'; label: string; color: string }[] = [
    { key: 'required', label: 'Required', color: 'bg-green-50 border-green-200' },
    { key: 'prohibited', label: 'Prohibited', color: 'bg-red-50 border-red-200' },
    { key: 'preferred', label: 'Preferred', color: 'bg-blue-50 border-blue-200' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Contract Builder</h2>
        <p className="text-gray-500">Define rules for your space. Click chips to add them to categories.</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">AI Contract Assistant</p>
        <p className="text-sm text-amber-700">Click the rules below to add them to Required, Prohibited, or Preferred categories. Then generate a contract draft.</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Pre-made rules</h3>
        <div className="flex flex-wrap gap-2">
          {PREMADE_RULES.map((rule) => {
            const inAny = allRules.includes(rule);
            return (
              <div key={rule} className="flex gap-1 items-center">
                <span className={'text-xs font-medium px-2.5 py-1 rounded-full border ' +
                  (inAny ? 'bg-gray-200 text-gray-400 border-gray-200' : 'bg-white border-gray-300 text-gray-700')}>
                  {rule}
                </span>
                {!inAny && (
                  <div className="flex gap-0.5">
                    {(['required', 'prohibited', 'preferred'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        title={'Add to ' + b}
                        onClick={() => addRule(b, rule)}
                        className={'text-xs px-1.5 py-0.5 rounded border transition-colors font-semibold ' +
                          (b === 'required' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                            b === 'prohibited' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                              'border-blue-300 text-blue-700 hover:bg-blue-50')}
                      >
                        {b === 'required' ? 'R' : b === 'prohibited' ? 'P' : 'F'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BUCKETS.map((bucket) => (
          <div key={bucket.key} className={'rounded-2xl border p-4 min-h-[100px] ' + bucket.color}>
            <h4 className="font-semibold text-sm mb-3 text-gray-700">{bucket.label}</h4>
            <div className="flex flex-wrap gap-2">
              {form.rules[bucket.key].map((rule) => (
                <span
                  key={rule}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white rounded-full border border-gray-300 shadow-sm text-gray-700"
                >
                  {rule}
                  <button
                    type="button"
                    onClick={() => removeRule(bucket.key, rule)}
                    className="ml-1 opacity-60 hover:opacity-100 text-base leading-none"
                  >
                    x
                  </button>
                </span>
              ))}
              {form.rules[bucket.key].length === 0 && (
                <p className="text-xs opacity-50 italic text-gray-500">None yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Add a custom rule</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRule}
            onChange={(e) => setCustomRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder="e.g., No generators over 5kW"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
          />
          <button type="button" onClick={addCustom} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700">
            Add
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setContractVisible(true)}
        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
      >
        Generate Contract Draft
      </button>
      {contractVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Contract Draft</h3>
              <button type="button" onClick={() => setContractVisible(false)} className="p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{contractText}</pre>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setContractVisible(false)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
              >
                Looks good, continue
              </button>
              <button
                type="button"
                onClick={() => setContractVisible(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Edit rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewSpacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    space_type: '',
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    size_sqft: '',
    operating_hours: '',
    price_per_day: '',
    price_per_month: '',
    instant_book: false,
    amenities: {},
    images: [],
    rules: { required: [], prohibited: [], preferred: [], custom: '' },
  });

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const canProceed = () => {
    if (step === 1) return !!(form.space_type && form.title && form.description);
    if (step === 2) return !!(form.city && form.state && form.zip_code && form.price_per_month);
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (const img of form.images) {
        const fd = new FormData();
        fd.append('file', img.file);
        fd.append('bucket', 'space-images');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) imageUrls.push(result.data.url);
      }
      const payload = {
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        space_type: form.space_type,
        size_sqft: form.size_sqft ? parseInt(form.size_sqft) : null,
        price_per_day: form.price_per_day ? parseFloat(form.price_per_day) : null,
        price_per_month: parseFloat(form.price_per_month),
        instant_book: form.instant_book,
        operating_hours: form.operating_hours,
        amenities: form.amenities,
        images: imageUrls.map((url) => ({ url })),
        rules: form.rules,
      };
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/my-spaces');
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch {
      alert('Failed to create space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/my-spaces"
            className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Spaces
          </Link>
          <p className="text-sm text-gray-500">{STEP_LABELS[step - 1]}</p>
        </div>
        <StepIndicator current={step} total={4} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && <Step1 form={form} update={update} />}
          {step === 2 && <Step2 form={form} update={update} />}
          {step === 3 && <Step3 form={form} update={update} />}
          {step === 4 && <Step4 form={form} update={update} />}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={'px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ' +
                  (canProceed() ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
              >
                {'Next: ' + STEP_LABELS[step]}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={'px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ' +
                  (loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white')}
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
