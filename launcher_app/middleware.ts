import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default async function middleware() {
  await auth();
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};