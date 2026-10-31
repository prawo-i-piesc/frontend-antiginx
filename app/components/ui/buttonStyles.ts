/**
 * Colours of the cyan call-to-action on the public pages: flat, no glow, a
 * shade lighter on hover. The hover shade is the lightest that keeps white
 * text at 4.5:1 (WCAG 1.4.3); cyan-600 would give 3.7:1.
 */
export const PRIMARY_BUTTON = 'border-cyan-700 bg-cyan-700 text-white hover:border-[#0a7f9e] hover:bg-[#0a7f9e]';

/**
 * Buttons inside the signed-in app. One shape and two sizes for every action,
 * so the eye can tell the main action from the rest by colour alone:
 *
 * - primary: the one action a view is for — new scan, run, confirm. Solid.
 * - secondary: everything else beside it. A bordered surface.
 * - ghost: actions that sit inside something, like a row or a header.
 * - danger: destructive actions, always behind a confirmation.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const BUTTON_BASE =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:focus-visible:ring-cyan-400 dark:focus-visible:ring-offset-zinc-950';

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs [&>i]:text-sm',
  md: 'h-9 px-3.5 text-sm [&>i]:text-base',
  /** Beside a 48px text field, so the two line up. */
  lg: 'h-12 px-5 text-sm [&>i]:text-base',
};

const ICON_BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-base',
  lg: 'h-12 w-12 text-lg',
};

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: `${PRIMARY_BUTTON} shadow-sm`,
  secondary:
    'border-zinc-300 bg-white text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
  ghost:
    'border-transparent text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100',
  danger:
    'border-rose-600/40 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-400',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return `${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]}`;
}

/** A square button holding only an icon; give it an aria-label. */
export function iconButtonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return `${BUTTON_BASE} ${ICON_BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]}`;
}
