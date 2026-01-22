// lib/safety/sanitizeMessage.ts

const EMAIL_REGEX =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX =
  /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const URL_REGEX = /\bhttps?:\/\/[^\s]+/gi;

const REPLACEMENT =
  '[contact removed — please keep communication inside B2B Market Space]';

export function sanitizeMessageBody(input: string): string {
  return input
    .replace(EMAIL_REGEX, REPLACEMENT)
    .replace(PHONE_REGEX, REPLACEMENT)
    .replace(URL_REGEX, REPLACEMENT);
}
