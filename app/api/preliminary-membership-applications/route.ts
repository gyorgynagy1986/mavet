import { createHash } from "node:crypto";

const applicationHashes = new Set<string>();
const categories = new Set([
  "rendes",
  "hallgatoi",
  "ifjusagi",
  "erdemes",
  "partolo",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const category = typeof body?.category === "string" ? body.category : "";
  const title = typeof body?.title === "string" ? body.title : "";
  const lastName =
    typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const firstName =
    typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const validTitle = title === "" || title === "Dr." || title === "Prof.";
  const valid =
    categories.has(category) &&
    validTitle &&
    lastName.length > 0 &&
    firstName.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    body?.consent === true;
  if (!valid) return Response.json({ ok: false }, { status: 400 });

  applicationHashes.add(createHash("sha256").update(email).digest("hex"));
  return Response.json({ ok: true, mock: true }, { status: 201 });
}
