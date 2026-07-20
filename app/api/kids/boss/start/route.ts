import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";
const MODEL = "claude-haiku-4-5-20251001";

interface BossItem {
  q: string;
  options: string[];
  correct: number;
}

/** Generate an 8-question mastery check for the skill, store the answer key
 *  server-side, and return only the questions + options to the child. */
export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "The boss is asleep — ask a grown-up." }, { status: 503 });

  let body: { skillId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!body.skillId) return NextResponse.json({ ok: false, error: "Missing skill" }, { status: 400 });

  const admin = getAdminClient();
  const [skillRes, learnerRes] = await Promise.all([
    admin.from("v_skill_coaching").select("*").eq("skill_id", body.skillId).maybeSingle(),
    admin.from("learners").select("dob").eq("id", learnerId).maybeSingle(),
  ]);
  const sk = skillRes.data as any;
  if (!sk) return NextResponse.json({ ok: false, error: "I can't find that quest." }, { status: 400 });
  const age = (learnerRes.data as any)?.dob
    ? Math.floor((Date.now() - new Date((learnerRes.data as any).dob).getTime()) / 31557600000)
    : 8;

  const system = [
    `You write a fair 8-question mastery quiz for a ${age}-year-old on ONE skill: "${sk.skill}" (${sk.subject}, level ${sk.level}).`,
    sk.success_criteria ? `Mastery means: ${sk.success_criteria}` : "",
    sk.misconception ? `Target this common mistake in at least 2 questions: ${sk.misconception}` : "",
    sk.real_world_hook ? `Where useful, use this hook the child enjoys: ${sk.real_world_hook}` : "",
    "Rules: multiple choice, exactly 4 options each, exactly one correct. Simple words for the age. Mixed difficulty; at least 2 questions apply the skill in a NEW situation (not a re-run of an example). Keep options short and unambiguous. No trick questions.",
    'Return ONLY valid JSON: an array of exactly 8 objects like {"q":"...","options":["..","..","..",".."],"correct":0}. No prose, no markdown, no code fences.',
  ]
    .filter(Boolean)
    .join("\n");

  let items: BossItem[] = [];
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: `Write the 8 questions for "${sk.skill}".` }],
      }),
    });
    if (!r.ok) return NextResponse.json({ ok: false, error: "The boss is warming up — try again." }, { status: 502 });
    const data = await r.json();
    let text = (data?.content ?? []).filter((c: any) => c?.type === "text").map((c: any) => c.text).join("");
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const s = text.indexOf("[");
    const e = text.lastIndexOf("]");
    if (s >= 0 && e > s) text = text.slice(s, e + 1);
    const parsed = JSON.parse(text);
    items = (Array.isArray(parsed) ? parsed : [])
      .filter(
        (it: any) =>
          it && typeof it.q === "string" && Array.isArray(it.options) && it.options.length === 4 &&
          Number.isInteger(it.correct) && it.correct >= 0 && it.correct <= 3
      )
      .slice(0, 8)
      .map((it: any) => ({ q: String(it.q), options: it.options.map(String), correct: it.correct }));
  } catch {
    return NextResponse.json({ ok: false, error: "The boss got confused — try again." }, { status: 502 });
  }
  if (items.length < 5) {
    return NextResponse.json({ ok: false, error: "The boss got confused — try again." }, { status: 502 });
  }

  const { data: attempt, error } = await admin
    .from("boss_attempts")
    .insert({ learner_id: learnerId, skill_id: body.skillId, items })
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    attemptId: (attempt as any).id,
    total: items.length,
    items: items.map((it) => ({ q: it.q, options: it.options })),
  });
}
