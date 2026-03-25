const categories = [
  'Food truck spots',
  'Dessert stands',
  'Pop-up retail',
  'Photo studios',
  'Production spaces',
  'Short-term pads',
  'Event-ready lots',
];

export function CategoryRow() {
  return (
    <section className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((c) => (
        <button key={c} className="whitespace-nowrap rounded-full border px-4 py-2 text-sm hover:bg-neutral-50">
          {c}
        </button>
      ))}
    </section>
  );
}
