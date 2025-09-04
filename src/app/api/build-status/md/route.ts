import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "CLIENT_STATUS_UPDATE.md");
    const content = fs.readFileSync(filePath, "utf8");
    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "CLIENT_STATUS_UPDATE.md not found" },
      { status: 404 },
    );
  }
}
