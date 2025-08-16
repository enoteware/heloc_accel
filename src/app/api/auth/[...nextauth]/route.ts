// NextAuth handlers temporarily disabled - using Stack Auth now
// import { handlers } from "@/auth"
// export const { GET, POST } = handlers

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message:
        "NextAuth disabled - using Stack Auth. Please use /handler/sign-in instead.",
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      message:
        "NextAuth disabled - using Stack Auth. Please use /handler/sign-in instead.",
    },
    { status: 410 },
  );
}
