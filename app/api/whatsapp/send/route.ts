import { NextResponse } from 'next/server'
import { sendWhatsApp } from '@/lib/whatsapp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const toE164 = body.toE164 as string
    const text = body.body as string
    if (!toE164 || !text) {
      return NextResponse.json({ error: 'toE164 and body required' }, { status: 400 })
    }
    const resp = await sendWhatsApp({ toE164, body: text })
    return NextResponse.json({ ok: true, resp })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
