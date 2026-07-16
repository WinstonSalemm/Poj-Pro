import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const leadLimiter = rateLimit({ interval: 10 * 60 * 1000, uniqueTokens: 10_000 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
  product?: unknown;
  startedAt?: unknown;
};

function asText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function clientToken(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function providerConfig() {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  if (!serviceId || !templateId || !publicKey) return null;
  return {
    serviceId,
    templateId,
    publicKey,
    privateKey: process.env.EMAILJS_PRIVATE_KEY?.trim() || undefined,
    recipient: process.env.LEAD_RECIPIENT_EMAIL?.trim() || undefined,
  };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  const expectedOrigin = host ? `${protocol}://${host}` : request.nextUrl.origin;
  if (!origin || origin !== expectedOrigin) {
    return NextResponse.json({ success: false, code: 'INVALID_ORIGIN' }, { status: 403 });
  }

  const limit = await leadLimiter.check(5, `lead:${clientToken(request)}`);
  if (limit.isRateLimited) {
    return NextResponse.json({ success: false, code: 'RATE_LIMITED' }, { status: 429, headers: limit.headers });
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 415, headers: limit.headers });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 413, headers: limit.headers });
  }

  let body: LeadRequest;
  try {
    body = await request.json() as LeadRequest;
  } catch {
    return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400, headers: limit.headers });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ success: true }, { status: 200, headers: limit.headers });
  }

  const startedAt = typeof body.startedAt === 'number' ? body.startedAt : 0;
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 800 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ success: false, code: 'INVALID_REQUEST' }, { status: 400, headers: limit.headers });
  }

  const name = asText(body.name, 80);
  const email = asText(body.email, 191)?.toLowerCase();
  const phone = asText(body.phone, 32);
  const message = asText(body.message, 2_000);
  const productSlug = typeof body.product === 'string' ? body.product.trim().slice(0, 200) || null : null;

  if (!name || name.length < 2 || !email || !EMAIL_RE.test(email) || !phone || (phone.match(/\d/g) || []).length < 7 || !message || message.length < 10) {
    return NextResponse.json({ success: false, code: 'VALIDATION_ERROR' }, { status: 400, headers: limit.headers });
  }

  const lead = await prisma.lead.create({
    data: { name, email, phone, message, productSlug },
    select: { id: true },
  });
  const config = providerConfig();

  if (!config) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { deliveryStatus: 'not_configured', deliveryError: 'Email provider is not configured' },
    });
    return NextResponse.json({ success: false, code: 'DELIVERY_UNAVAILABLE' }, { status: 503, headers: limit.headers });
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        ...(config.privateKey ? { accessToken: config.privateKey } : {}),
        template_params: {
          from_name: name,
          from_email: email,
          from_Number: phone,
          message,
          product: productSlug || '',
          source: 'contact-form',
          ...(config.recipient ? { to_email: config.recipient } : {}),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 160);
      await prisma.lead.update({
        where: { id: lead.id },
        data: { deliveryStatus: 'failed', deliveryError: detail || `Provider returned ${response.status}` },
      });
      console.error('[leads][POST] delivery failed', { leadId: lead.id, status: response.status });
      return NextResponse.json({ success: false, code: 'DELIVERY_FAILED' }, { status: 502, headers: limit.headers });
    }

    await prisma.lead.update({ where: { id: lead.id }, data: { deliveryStatus: 'sent', deliveryError: null } });
    return NextResponse.json({ success: true }, { status: 201, headers: limit.headers });
  } catch (error) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { deliveryStatus: 'failed', deliveryError: error instanceof Error ? error.name : 'Unknown delivery error' },
    });
    console.error('[leads][POST] delivery exception', { leadId: lead.id, error: error instanceof Error ? error.name : 'unknown' });
    return NextResponse.json({ success: false, code: 'DELIVERY_FAILED' }, { status: 502, headers: limit.headers });
  }
}
