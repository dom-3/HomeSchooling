import { Card, CardHeader, CardBody } from "@/components/ui";

/**
 * Proof & insights — the proof layer (growth snapshots, the honest NGRT/PUMA
 * vs national comparison, audit pack). v1 ships as a placeholder shell; it
 * earns a nav slot now so the structure is stable (Design Spec §2, §7).
 */
export default function ProofPage() {
  return (
    <div className="px-6 pb-16 pt-[22px]">
      <Card>
        <CardHeader icon="▤" title="Proof & insights" />
        <CardBody>
          <div className="flex flex-col items-center gap-3 py-10 text-center text-ink-3">
            <div className="grid h-12 w-12 place-items-center rounded-[12px] border border-hairline bg-surface-2 text-xl">
              ▤
            </div>
            <div className="text-[14px] font-semibold text-ink-2">Coming soon</div>
            <p className="max-w-[440px] text-[12.5px]">
              The system&apos;s legal shield: growth snapshots over time, the honest standardised
              comparison (NGRT / PUMA vs national average — presented humbly, never as a league
              table), and the one-tap audit pack for Carmarthenshire EHE.
            </p>
            <p className="max-w-[440px] text-[12px]">
              Reads <code>growth_snapshots</code>, <code>assessments</code>, <code>benchmarks</code>,{" "}
              <code>audit_reports</code>. The deep dashboards are explicitly &quot;later&quot; in the
              Build Brief; the Data &amp; Insights Analyst owns what they compute.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
