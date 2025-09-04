import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.cwd();
  const result: { buildLog?: string; successSummary?: string } = {};
  try {
    const p = path.join(base, "BUILD_LOG.md");
    if (fs.existsSync(p)) {
      result.buildLog = fs.readFileSync(p, "utf8");
    }
  } catch {}
  try {
    const p2 = path.join(base, "BUILD_SUCCESS_SUMMARY.md");
    if (fs.existsSync(p2)) {
      result.successSummary = fs.readFileSync(p2, "utf8");
    }
  } catch {}
  if (!result.buildLog && !result.successSummary) {
    return NextResponse.json(
      { error: "No build markdown found" },
      { status: 404 },
    );
  }
  return NextResponse.json(result);
}
