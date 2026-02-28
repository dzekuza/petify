import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "page_access_granted";
const ACCESS_CODE = process.env.PAGE_ACCESS_CODE || process.env.NEXT_PUBLIC_PAGE_ACCESS_CODE || "7ftGiMiy";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Missing code" }, { status: 400 });
    }

    if (code !== ACCESS_CODE) {
      return NextResponse.json({ success: false, error: "Invalid code" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: "true",
      maxAge: MAX_AGE_SECONDS,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}
