import { isValidEmail } from "@/lib/validation/email"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const valid =
    body &&
    typeof body.name === "string" &&
    body.name.trim().length >= 2 &&
    typeof body.email === "string" &&
    isValidEmail(body.email) &&
    typeof body.message === "string" &&
    body.message.trim().length >= 10 &&
    body.consent === true;
  if (!valid) return Response.json({ ok: false }, { status: 400 });
  return Response.json({ ok: true, mock: true }, { status: 201 });
}
