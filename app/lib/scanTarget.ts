/**
 * The address to scan as the API takes it, however it was typed.
 *
 * The API accepts only http and https URLs, while people type example.com, paste
 * a mangled scheme or paste the same one twice. Which of the two goes in front
 * changes nothing about the scan: the engine gets the host and picks the
 * protocols itself. The API has the last word on everything else, so another
 * scheme stays as typed for it to refuse.
 */
export function normalizeTargetUrl(input: string): string {
  const address = input.trim();
  if (!address) return "";

  const typed = /^(?:https?:\/*)*(https?):\/*(.*)$/i.exec(address);
  if (typed) return `${typed[1].toLowerCase()}://${typed[2]}`;

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(address)) return address;

  return `https://${address.replace(/^\/+/, "")}`;
}
