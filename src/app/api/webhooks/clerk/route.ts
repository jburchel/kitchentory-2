// Temporarily disabled for brand verification build
/*
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { api } from "@/../../../convex/_generated/api"
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 })
  }

  // Get the body
  const payload = await request.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type
  const { id: clerkId } = evt.data

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt)
        break
      case 'user.updated':
        await handleUserUpdated(evt)
        break
      case 'user.deleted':
        await handleUserDeleted(evt)
        break
      case 'session.created':
        await handleSessionCreated(evt)
        break
      case 'session.ended':
      case 'session.removed':
      case 'session.revoked':
        await handleSessionEnded(evt)
        break
      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handler functions
async function handleUserCreated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data
  
  const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id)
  const primaryPhone = phone_numbers?.find((phone: any) => phone.id === evt.data.primary_phone_number_id)

  await convex.mutation(api.users.createOrUpdateUser, {
    clerkId: id,
    email: primaryEmail?.email_address || '',
    firstName: first_name || undefined,
    lastName: last_name || undefined,
    imageUrl: image_url || undefined,
    phoneNumber: primaryPhone?.phone_number || undefined,
  })

  console.log(`User created: ${id}`)
}

async function handleUserUpdated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data
  
  const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id)
  const primaryPhone = phone_numbers?.find((phone: any) => phone.id === evt.data.primary_phone_number_id)

  await convex.mutation(api.users.createOrUpdateUser, {
    clerkId: id,
    email: primaryEmail?.email_address || '',
    firstName: first_name || undefined,
    lastName: last_name || undefined,
    imageUrl: image_url || undefined,
    phoneNumber: primaryPhone?.phone_number || undefined,
  })

  console.log(`User updated: ${id}`)
}

async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data

  await convex.mutation(api.users.deleteUser, {
    clerkId: id,
  })

  console.log(`User deleted: ${id}`)
}

async function handleSessionCreated(evt: WebhookEvent) {
  const { id: sessionId, user_id, expire_at, client_id } = evt.data
  
  // Extract client info from event attributes if available
  const clientIp = (evt as any).event_attributes?.http_request?.client_ip
  const userAgent = (evt as any).event_attributes?.http_request?.user_agent

  await convex.mutation(api.users.createUserSession, {
    userId: user_id,
    sessionId,
    expiresAt: expire_at,
    ipAddress: clientIp || undefined,
    userAgent: userAgent || undefined,
    clientId: client_id || undefined,
  })

  console.log(`Session created: ${sessionId} for user: ${user_id}`)
}

async function handleSessionEnded(evt: WebhookEvent) {
  const { id: sessionId, user_id } = evt.data

  await convex.mutation(api.users.endUserSession, {
    sessionId,
  })

  console.log(`Session ended: ${sessionId} for user: ${user_id}`)
}
*/

// Placeholder export for build
export async function POST() {
  return new Response('Webhook disabled for brand verification', { status: 200 })
}