import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/company";

/**
 * Recebe o formulário de contato (ContactCta) e envia por e-mail — sem
 * CRM na v1, este é o único canal além do wa.me (briefing seção 8).
 * Anti-spam por honeypot (checado no client, revalidado aqui) + rate
 * limit simples em memória (aceitável para uma instância única no
 * cPanel; reseta a cada restart do processo).
 */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

interface LeadPayload {
  nome?: string;
  telefone?: string;
  email?: string;
  mensagem?: string;
  contexto?: string;
  empresa?: string; // honeypot
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Muitas tentativas, tente novamente em instantes." }, { status: 429 });
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.empresa) {
    // honeypot preenchido: finge sucesso para não ensinar o bot, não envia nada
    return NextResponse.json({ ok: true });
  }

  if (!body.nome || !body.telefone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEADS_EMAIL_FROM, LEADS_EMAIL_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !LEADS_EMAIL_FROM) {
    console.error("[leads] SMTP não configurado — lead recebido mas NÃO enviado por e-mail:", body);
    return NextResponse.json(
      { error: "Envio de e-mail não configurado no servidor." },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: LEADS_EMAIL_FROM,
      to: LEADS_EMAIL_TO ?? COMPANY.emailLeads,
      replyTo: body.email || undefined,
      subject: `Novo contato pelo site${body.contexto ? ` — ${body.contexto}` : ""}`,
      text: [
        `Nome: ${body.nome}`,
        `Telefone: ${body.telefone}`,
        `E-mail: ${body.email ?? "(não informado)"}`,
        `Contexto: ${body.contexto ?? "(não informado)"}`,
        "",
        "Mensagem:",
        body.mensagem ?? "(sem mensagem)",
      ].join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads] falha ao enviar e-mail:", err);
    return NextResponse.json({ error: "Falha ao enviar. Tente pelo WhatsApp." }, { status: 502 });
  }
}
