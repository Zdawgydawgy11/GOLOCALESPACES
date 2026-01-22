// lib/utils/dates.ts
export function toISODateString(d: Date): string {
  return d.toISOString();
}

export function parseISODate(value: string): Date {
  return new Date(value);
}
