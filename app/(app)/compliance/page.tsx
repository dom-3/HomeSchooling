import { getDashboardData } from "@/lib/data";
import { Card, CardHeader, CardBody, StatusPill, ListRow, EmptyState } from "@/components/ui";
import { relDays } from "@/lib/format";

/**
 * Compliance — the compliance/credits/contacts backbone. READ-ONLY in v1:
 * edits happen in the Airtable cockpit (SDD decision 17). Household-level —
 * ignores the learner switcher.
 */
export default async function CompliancePage() {
  const { compliance } = await getDashboardData();

  const pill = (u: string) =>
    u === "overdue"
      ? { v: "danger" as const, l: "Overdue" }
      : u === "due_soon"
        ? { v: "warn" as const, l: "Due soon" }
        : u === "logged"
          ? { v: "info" as const, l: "Logged" }
          : { v: "info" as const, l: "Scheduled" };

  return (
    <div className="px-6 pb-16 pt-[22px]">
      <div className="mb-4 rounded-card border border-hairline bg-info-tint/50 px-4 py-3 text-[12.5px] text-ink-2">
        <b className="text-info">Read-only.</b> Legal items, credit-hours roll-up and contacts are
        the Airtable cockpit&apos;s home (synced one-way to Supabase). Make edits in Airtable; a
        deliberate write-back can come later.
      </div>
      <Card>
        <CardHeader icon="⚖" title={`Legal items & next actions (${compliance.length})`} />
        <CardBody>
          {compliance.length === 0 ? (
            <EmptyState title="All clear" sub="Nothing due. The backbone is synced from Airtable." />
          ) : (
            <div className="flex flex-col">
              {compliance.map((c, i, arr) => {
                const p = pill(c.urgency);
                return (
                  <ListRow
                    key={c.id}
                    last={i === arr.length - 1}
                    leading={<StatusPill variant={p.v}>{p.l}</StatusPill>}
                    title={c.event}
                    subtitle={c.notes ?? undefined}
                    trailing={
                      <span className="flex items-center gap-3">
                        {c.document_link ? (
                          <a href={c.document_link} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-brand hover:underline">
                            Doc →
                          </a>
                        ) : null}
                        <span
                          className="whitespace-nowrap text-[12px] font-semibold text-ink-2"
                          style={c.urgency === "overdue" ? { color: "var(--danger)" } : undefined}
                        >
                          {c.urgency === "logged" ? "✓" : relDays(c.action_date)}
                        </span>
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
