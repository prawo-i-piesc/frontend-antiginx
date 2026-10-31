import type { Ref } from "react";

/**
 * The heading of every signed-in page, so titles and their actions sit in the
 * same place everywhere: actions on the right, centred on the title block.
 * On a phone the actions stay beside the title and show as icons only (see
 * PAGE_ACTION_LABEL).
 */
export default function PageHeader({
  title,
  description,
  actions,
  headingRef,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** For a view that sends focus to its heading when it swaps in. */
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1
          ref={headingRef}
          tabIndex={headingRef ? -1 : undefined}
          className="text-2xl font-bold text-zinc-900 focus:outline-none dark:text-zinc-100"
        >
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/**
 * For a page action's button and its label: icon only on a phone, where the
 * title needs the room. The label goes to sr-only, so the button keeps its name.
 */
export const PAGE_ACTION = "max-sm:w-9 max-sm:px-0";
export const PAGE_ACTION_LABEL = "max-sm:sr-only";

/**
 * The padding of every signed-in page. With no top bar from lg up, the page
 * starts at the window's edge, so it gets a little more room above the title.
 */
export const PAGE_PADDING = "p-4 sm:p-6 lg:pt-8";
