import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const hasilMD = "lorem ipsum";
  return Response.json({ markdown: `${hasilMD}` });
}
