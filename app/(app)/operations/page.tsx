import { getDashboardData } from "@/lib/data";
import { Card, CardHeader, CardBody, StatusPill, Avatar, ListRow, EmptyState } from "@/components/ui";
import { relDays, initials } from "@/lib/format";

/** Operations — the build/admin board + persona team (read view in v1). */
export default async function OperationsPage() {
  const { ops } = await getDashboardData();

  const personaColor = (persona: string | null): string => {
    const p = (persona ?? "").toLowerCase();
    if (p.includes("security")) return "var(--info)";
    if (p.includes("backend")) return "var(--brand)";
    if (p.includes("frontend")) return "var(--rupert)";
    if (p.includes("design") || p.includes("ux")) return "var(--albie)";
    if (p.includes("data") || p.includes("analyst")) return "var(--warn)";
    return "var(--ink-2)";
  };
  const pill = (u: string) =>
    u === "overdue"
      ? { v: "danger" as const, l: "Overdue" }
      : u === "due_soon"
        ? { v: "warn" as const, l: "Due soon" }
        : u === "no_date"
          ? { v: "info" as const, l: "No date" }
          : { v: "info" as const, l: "Later" };

  return (
    <div className="px-6 pb-16 pt-[22px]">
      <Card>
        <CardHeader icon="☰" title={`Open ops & build tasks (${ops.length})`} />
        <CardBody>
          {ops.length === 0 ? (
            <EmptyState title="No open tasks" sub="Build & admin tasks with an assignee show here." />
          ) : (
            <div className="flex flex-col">
              {ops.map((o, i, arr) => {
                const p = pill(o.urgency);
                return (
                  <ListRow
                    key={o.id}
                    last={i === arr.length - 1}
                    leading={<Avatar initials={initials(o.assignee_persona ?? o.assignee)} color={personaColor(o.assignee_persona)} />}
                    title={o.title}
                    subtitle={`${o.assignee_persona ?? o.assignee ?? "Unassigned"}${o.category ? ` · ${o.category}` : ""}`}
                    trailing={
                      <span className="flex items-center gap-2">
                        {o.status ? <StatusPill variant="info">{o.status}</StatusPill> : null}
                        <StatusPill variant={p.v}>{p.l}</StatusPill>
                        {o.due_date ? (
                          <span className="whitespace-nowrap text-[12px] font-semibold text-ink-2">
                            {relDays(o.due_date)}
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
          <p className="mt-3 border-t border-hairline pt-3 text-[12px] text-ink-3">
            v1 displays open tasks read from <code>ops_tasks</code> + <code>team_members</code>.
            Creating / editing tasks is a later write-back.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
