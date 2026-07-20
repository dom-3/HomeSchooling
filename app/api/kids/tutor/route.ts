import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getKidLearnerId } from "@/lib/kids/session";

export const dynamic = "force-dynamic";

/**
 * The AI coach. Hints-and-questions-first, locked to ONE skill, every exchange
 * logged for the parent. The learner is taken from the signed cookie, never the
 * body, so a child can only ever ask as himself. The API key is server-only.
 */
const MODEL = "claude-haiku-4-5-20251001";
const MAX_MSG = 500;
const HISTORY = 8;

export async function POST(req: NextRequest) {
  const learnerId = getKidLearnerId();
  if (!learnerId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Your coach isn't switched on yet — ask a grown-up." },
      { status: 503 }
    );
  }

  let body: { skillId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const message = (body.message ?? "").trim().slice(0, MAX_MSG);
  if (!message || !body.skillId) {
    return NextResponse.json({ ok: false, error: "Ask me something about your quest!" }, { status: 400 });
  }

  const admin = getAdminClient();
  const [skillRes, learnerRes, histRes] = await Promise.all([
    admin.from("v_skill_coaching").select("*").eq("skill_id", body.skillId).maybeSingle(),
    admin.from("learners").select("name, dob").eq("id", learnerId).maybeSingle(),
    admin
      .from("tutor_messages")
      .select("role, text")
      .eq("learner_id", learnerId)
      .eq("skill_id", body.skillId)
      .order("created_at", { ascending: false })
      .limit(HISTORY),
  ]);

  const sk = skillRes.data as any;
  if (!sk) return NextResponse.json({ ok: false, error: "I can't find that quest." }, { status: 400 });

  const learner = learnerRes.data as any;
  const firstName = String(learner?.name ?? "friend").split(" ")[0];
  const age = learner?.dob
    ? Math.floor((Date.now() - new Date(learner.dob).getTime()) / 31557600000)
    : 8;

  const system = [
    `You are "Coach", a warm, playful learning coach for ${firstName}, a ${age}-year-old child in Wales who is home-educated.`,
    `${firstName} is working on ONE skill: "${sk.skill}" (${sk.subject}, level ${sk.level}).`,
    sk.description ? `What it means: ${sk.description}` : "",
    sk.lesson ? `How it is being taught: ${sk.lesson}` : "",
    sk.success_criteria ? `Success looks like: ${sk.success_criteria}` : "",
    sk.misconception ? `The common mistake to watch for: ${sk.misconception}` : "",
    sk.real_world_hook ? `A real-world hook he enjoys: ${sk.real_world_hook}` : "",
    "",
    "HOW YOU MUST BEHAVE:",
    "- NEVER give the final answer, and never do the work for him.",
    "- Give ONE small hint, or ask ONE guiding question that helps him think it out himself.",
    "- Break things into the smallest next step. Praise effort and thinking, not being clever.",
    "- Reply in 1-3 SHORT sentences, in simple words a child of this age reads easily. Warm and encouraging.",
    "- Stay strictly on this one skill. If he asks about anything else - another subject, personal topics, or anything unsafe or upsetting - kindly say you only help with this quest and tell him to ask his grown-up. Do not answer it.",
    "- Never ask for personal information (address, school, passwords, photos).",
    "- A parent is present and reads every message you send.",
    "- If he seems stuck or upset, encourage him to ask his grown-up, who is right there with him.",
  ]
    .filter(Boolean)
    .join("\n");

  const history = ((histRes.data ?? []) as { role: string; text: string }[])
    .reverse()
    .map((m) => ({ role: m.role === "child" ? "user" : "assistant", content: m.text }));
  // The API needs the first message to be from the user.
  while (history.length && history[0].role !== "user") history.shift();

  // F5: log the child's message FIRST, so it's captured even if the model errors.
  await admin
    .from("tutor_messages")
    .insert({ learner_id: learnerId, skill_id: body.skillId, role: "child", text: message });

  let reply = "";
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system,
        messages: [...history, { role: "user", content: message }],
      }),
    });
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: "Your coach is having a think — try again in a moment." },
        { status: 502 }
      );
    }
    const data = await r.json();
    reply = (data?.content ?? [])
      .filter((c: any) => c?.type === "text")
      .map((c: any) => c.text)
      .join(" ")
      .trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Couldn't reach your coach — try again." }, { status: 502 });
  }
  if (!reply) reply = "Have another go — what do you notice first?";

  await admin
    .from("tutor_messages")
    .insert({ learner_id: learnerId, skill_id: body.skillId, role: "coach", text: reply });

  return NextResponse.json({ ok: true, reply });
}
