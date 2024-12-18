import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  console.log("middleware====", req.url);

  return NextResponse.next();
}
