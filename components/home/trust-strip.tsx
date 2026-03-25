import { ShieldCheck, FileCheck2, MessageCircleMore, MapPinned } from 'lucide-react';

const items = [
  {
    icon: MessageCircleMore,
    title: 'Message before you commit',
    body: 'Talk to hosts inside MarketSpace before requesting a booking so fit, restrictions, and expectations are clear.',
  },
  {
    icon: FileCheck2,
    title: 'Host-reviewed agreements',
    body: 'Lease language can be templated or AI-assisted, but hosts always approve final terms before renters accept.',
  },
  {
    icon: ShieldCheck,
    title: 'Permit and document uploads',
    body: 'For commercial-use listings, renters can upload permits, insurance, certifications, and setup details in-platform.',
  },
  {
    icon: MapPinned,
    title: 'Reference-linked compliance',
    body: 'Hosts can link official sources and dates checked, while MarketSpace clearly labels all zoning and permit data as reference-only.',
  },
];

export function TrustStrip() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-3xl border p-5">
            <Icon className="h-5 w-5" />
            <h3 className="mt-4 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
          </div>
        );
      })}
    </section>
  );
}
