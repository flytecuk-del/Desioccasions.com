export type WhatsAppProvider = 'twilio' | 'cloud'

type SendWhatsAppArgs = {
  toE164: string
  body: string
}

export async function sendWhatsApp({ toE164, body }: SendWhatsAppArgs) {
  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio') as WhatsAppProvider
  if (provider === 'cloud') {
    return sendCloudWhatsApp({ toE164, body })
  }
  return sendTwilioWhatsApp({ toE164, body })
}

async function sendTwilioWhatsApp({ toE164, body }: SendWhatsAppArgs) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!sid || !token || !from) {
    throw new Error('Twilio WhatsApp env vars not set')
  }

  const params = new URLSearchParams()
  params.set('From', from)
  params.set('To', `whatsapp:${toE164}`)
  params.set('Body', body)

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twilio error: ${res.status} ${text}`)
  }

  return res.json()
}

async function sendCloudWhatsApp({ toE164, body }: SendWhatsAppArgs) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    throw new Error('WhatsApp Cloud env vars not set')
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toE164.replace('+', ''),
      type: 'text',
      text: { body }
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloud WhatsApp error: ${res.status} ${text}`)
  }
  return res.json()
}
