"use client";

import Link from "next/link";

import { DATA } from "@/app/components/ui/table";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { ScanTestOption, TestCategory } from "@/app/lib/api";

/** Key for a category; the backend may send an empty name. */
function categoryKey(category: TestCategory, index: number): string {
  return category.category || `other-${index}`;
}

/**
 * The engine's tests by category, each a toggle: a tick when it runs, a plus
 * when it does not. A test the plan does not include is a link to the plans
 * instead. The parent keeps the selection, its count and "select all".
 */
export default function TestPicker({
  idPrefix,
  categories,
  selected,
  onToggle,
  isLocked = () => false,
  disabled = false,
}: {
  /** Unique per form, for the category headings. */
  idPrefix: string;
  categories: TestCategory[];
  selected: readonly string[];
  onToggle: (testId: string) => void;
  isLocked?: (test: ScanTestOption) => boolean;
  disabled?: boolean;
}) {
  const { t, locale } = useI18n();

  const categoryName = (name: string) => (name ? (t.scan.categories[name] ?? name) : t.scan.categoryOther);
  const testName = (test: ScanTestOption) =>
    t.scan.testsShort[test.id] ?? test.label.charAt(0).toLocaleUpperCase(INTL_LOCALES[locale]) + test.label.slice(1);

  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const headingId = `${idPrefix}-category-${index}`;
        const selectable = category.tests.filter((test) => !isLocked(test));
        const selectedCount = selectable.filter((test) => selected.includes(test.id)).length;

        return (
          <div key={categoryKey(category, index)} role="group" aria-labelledby={headingId}>
            <div className="mb-2 flex items-baseline gap-3">
              <p id={headingId} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {categoryName(category.category)}
              </p>
              <span className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>
                <span aria-hidden="true">
                  {selectedCount}/{selectable.length}
                </span>
                <span className="sr-only">{t.scanner.form.selectedCount(selectedCount, selectable.length)}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {category.tests.map((test) => {
                if (isLocked(test)) {
                  return (
                    <Link
                      key={test.id}
                      href="/pricing"
                      title={t.scanner.form.proTest}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                    >
                      <i className="ri-lock-line text-sm leading-none" aria-hidden="true"></i>
                      {testName(test)}
                      <span className="text-xs font-medium">{t.shell.plans.pro}</span>
                      <span className="sr-only">. {t.scanner.form.proTest}</span>
                    </Link>
                  );
                }
                const on = selected.includes(test.id);
                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => onToggle(test.id)}
                    aria-pressed={on}
                    disabled={disabled}
                    title={test.id}
                    className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      on
                        ? "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
                        : "border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    {/* On or off in a shape too, not only in colour. */}
                    <i
                      className={`text-sm leading-none ${on ? "ri-check-line text-cyan-700 dark:text-cyan-400" : "ri-add-line"}`}
                      aria-hidden="true"
                    ></i>
                    {testName(test)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
