"use client";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import UserInspector from "@/app/components/admin/UserInspector";
import { Empty } from "@/app/components/admin/Sheet";
import {
  CONTROL,
  DATA,
  Flag,
  ICON_BUTTON,
  IdCell,
  LoadFailure,
  PANEL,
  ROW,
  SCROLL_REGION,
  Stamp,
  TABLE,
  TD,
  TH,
  THEAD,
  TOOLBAR,
  TableFooter,
  TableLoading,
  TableMessage,
  Tag,
  pagingFrom,
  useClampPage,
} from "@/app/components/ui/table";
import useApiQuery from "@/app/hooks/useApiQuery";
import useQueryParams from "@/app/hooks/useQueryParams";
import useSearchDraft from "@/app/hooks/useSearchDraft";
import { useI18n } from "@/app/i18n/I18nProvider";
import { listUsers } from "@/app/lib/adminApi";
import { PAGE_SIZES } from "@/app/lib/paging";
import { useAuth } from "@/app/providers/AuthProvider";

export default function AdminUsersPage() {
  const { t } = useI18n();

  return (
    <AdminFrame activePage="users" heading={{ title: t.admin.users.title, description: t.admin.users.description }}>
      <UsersView />
    </AdminFrame>
  );
}

function UsersView() {
  const { t, format } = useI18n();
  const copy = t.admin.users;
  const { user: me } = useAuth();
  const [params, update] = useQueryParams();

  const q = params.get("q")?.trim() ?? "";
  const userParam = params.get("user");
  const { page, size, offset } = pagingFrom(params);

  const [draft, setDraft] = useSearchDraft(q, (next) => update({ q: next || null, page: null }));

  const { data, loading, error, reload } = useApiQuery(`users:${q}:${size}:${offset}`, (signal) =>
    listUsers({ q: q || undefined, limit: size, offset }, signal),
  );

  useClampPage(data?.total, page, size, update);

  if (error?.kind === "forbidden") return <NoAccess />;

  const users = data?.users ?? [];

  return (
    <>
      <div className={PANEL}>
        <div className={TOOLBAR}>
          <div className="relative w-full sm:w-80">
            <i
              className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label={copy.search}
              placeholder={`${copy.search}…`}
              maxLength={320}
              className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 dark:placeholder:text-zinc-500`}
            />
          </div>
          <p role="status" className={`${DATA} ml-auto text-xs text-zinc-600 dark:text-zinc-400`}>
            {data ? t.table.records(data.total, format.number(data.total)) : null}
          </p>
        </div>

        {error ? (
          <LoadFailure error={error} title={t.admin.loadError} onRetry={reload} />
        ) : !data ? (
          <TableLoading columns={8} />
        ) : users.length === 0 ? (
          <TableMessage>
            {q ? (
              <>
                <p>{copy.noMatches(q)}</p>
                <button
                  type="button"
                  onClick={() => {
                    setDraft("");
                    update({ q: null, page: null });
                  }}
                  className="mt-2 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {copy.clearSearch}
                </button>
              </>
            ) : (
              copy.empty
            )}
          </TableMessage>
        ) : (
          // Eight columns do not fit a phone: the table scrolls sideways
          // instead, and is focusable so that works from the keyboard too.
          <div
            role="region"
            aria-label={copy.title}
            tabIndex={0}
            className={SCROLL_REGION}
          >
            <table className={`${TABLE} min-w-[60rem]`} aria-busy={loading || undefined}>
              <caption className="sr-only">{copy.caption}</caption>
              <thead className={THEAD}>
                <tr>
                  <th scope="col" className={`${TH} w-32`}>
                    {copy.columns.id}
                  </th>
                  <th scope="col" className={TH}>
                    {copy.columns.email}
                  </th>
                  <th scope="col" className={`${TH} w-44`}>
                    {copy.columns.name}
                  </th>
                  <th scope="col" className={`${TH} w-28`}>
                    {copy.columns.role}
                  </th>
                  <th scope="col" className={`${TH} w-36`}>
                    {copy.columns.verification}
                  </th>
                  <th scope="col" className={`${TH} w-20`}>
                    {copy.columns.totp}
                  </th>
                  <th scope="col" className={`${TH} w-40`}>
                    {copy.columns.created}
                  </th>
                  <th scope="col" className={`${TH} w-14 text-right`}>
                    <span className="sr-only">{copy.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${loading ? "opacity-50" : ""}`}>
                {users.map((user) => (
                  <tr key={user.id} className={ROW}>
                    <td className={TD}>
                      <IdCell id={user.id} />
                    </td>
                    <td className={`${TD} w-full max-w-0`}>
                      <span className="flex items-center gap-2">
                        <span className="truncate" title={user.email}>
                          {user.email}
                        </span>
                        {user.id === me?.id ? <Tag tone="violet">{t.admin.you}</Tag> : null}
                      </span>
                    </td>
                    <td className={`${TD} max-w-44`}>
                      <span className="block truncate text-zinc-600 dark:text-zinc-400" title={user.full_name || undefined}>
                        {user.full_name || <Empty />}
                      </span>
                    </td>
                    <td className={TD}>
                      <Tag tone={user.role === "admin" ? "cyan" : "zinc"}>{t.admin.roles[user.role]}</Tag>
                    </td>
                    <td className={TD}>
                      <Flag on={user.email_verified} label={user.email_verified ? copy.verified : copy.unverified} />
                    </td>
                    <td className={TD}>
                      <Flag on={user.totp_enabled} label={user.totp_enabled ? copy.totpOn : copy.totpOff} />
                    </td>
                    <td className={TD}>
                      <Stamp value={user.created_at} />
                    </td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={() => update({ user: user.id })}
                        aria-label={`${copy.inspect} ${copy.inspectContext(user.email)}`}
                        title={copy.inspect}
                        className={`${ICON_BUTTON} h-8 w-8`}
                      >
                        <i className="ri-side-bar-line" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 ? (
          <TableFooter
            total={data.total}
            offset={offset}
            size={size}
            onPageChange={(next) => update({ page: next === 1 ? null : next })}
            onSizeChange={(next) => update({ size: next === PAGE_SIZES[0] ? null : next, page: null })}
          />
        ) : null}
      </div>

      <UserInspector
        userId={userParam}
        onClose={() => update({ user: null })}
        onChange={() => reload()}
      />
    </>
  );
}
