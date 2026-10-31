"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BUTTON_QUIET } from "@/app/components/profile/ui";
import DashboardShell, { type AdminPage } from "@/app/components/layout/DashboardShell";
import PagePending from "@/app/components/layout/PagePending";
import PageHeader from "@/app/components/layout/PageHeader";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Sign-in and role gate, shell and page heading for every admin view.
 *
 * An account without the admin role gets the 404 page: the panel does not
 * advertise that it exists. The views mount only past the gate, so none of
 * their requests go out for anyone else. This is navigation, not security —
 * every /api/admin route checks the role again on the server.
 */
export default function AdminFrame({
  activePage,
  heading,
  children,
}: {
  activePage: AdminPage;
  /** Left out by a view that lays out its own heading and padding. */
  heading?: { title: string; description: string };
  children: React.ReactNode;
}) {
  const { authenticated, initialized, auth } = useRequireAuth();

  if (!initialized || !authenticated || !auth.user) return <PagePending layout={heading ? "table" : "widgets"} />;
  if (auth.user.role !== "admin") notFound();

  return (
    <DashboardShell area="admin" activePage={activePage} mainClassName={heading ? "p-4 sm:p-6" : ""}>
      {heading ? (
        <PageHeader title={heading.title} description={heading.description} />
      ) : null}
      {/* The views keep their filters in the address, which needs a boundary. */}
      <Suspense fallback={null}>{children}</Suspense>
    </DashboardShell>
  );
}

/**
 * Shown in place of a view when the API answers FORBIDDEN: the role was taken
 * away after the page loaded, and the session still says admin.
 */
export function NoAccess() {
  const { t } = useI18n();
  const copy = t.admin.noAccess;

  return (
    <div
      role="alert"
      className="rounded-xl border border-zinc-300 bg-white/85 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30"
    >
      <i className="ri-lock-2-line text-3xl text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{copy.title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">{copy.description}</p>
      <Link href="/dashboard" className={`${BUTTON_QUIET} mt-5`}>
        {copy.back}
      </Link>
    </div>
  );
}
