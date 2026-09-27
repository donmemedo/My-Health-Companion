import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = () => process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

async function proxy(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const target = `${BACKEND()}/api/${path.join("/")}${url.search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) { return proxy(req, (await ctx.params).path); }
export async function POST(req: NextRequest, ctx: Ctx) { return proxy(req, (await ctx.params).path); }
export async function PATCH(req: NextRequest, ctx: Ctx) { return proxy(req, (await ctx.params).path); }
export async function PUT(req: NextRequest, ctx: Ctx) { return proxy(req, (await ctx.params).path); }
export async function DELETE(req: NextRequest, ctx: Ctx) { return proxy(req, (await ctx.params).path); }
