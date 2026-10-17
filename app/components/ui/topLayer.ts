/**
 * Where UI that must stay reachable above everything else gets rendered.
 *
 * A modal <dialog> makes the rest of the document inert — hidden from screen
 * readers and unclickable — so toasts and their live regions rendered in the
 * page go silent, and show up under the backdrop, while a dialog is open.
 * Each open Dialog registers a host element inside itself; whatever needs to
 * stay on top renders into the innermost one, or in place when there is none.
 */

const hosts: HTMLElement[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function addTopLayerHost(host: HTMLElement): void {
  hosts.push(host);
  emit();
}

export function removeTopLayerHost(host: HTMLElement): void {
  const index = hosts.lastIndexOf(host);
  if (index === -1) return;
  hosts.splice(index, 1);
  emit();
}

export function subscribeTopLayerHost(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The innermost open dialog's host, or null when no dialog is open. */
export function getTopLayerHost(): HTMLElement | null {
  return hosts[hosts.length - 1] ?? null;
}
