/**
 * mintInterface.ts
 *
 * Payment provider abstraction layer for Refueler's Lightning/ecash payment rail.
 *
 * Routes payment instructions to the active provider without coupling the order
 * lifecycle layer (`merchant_orders`, order state machine) to any single payment
 * implementation. Today this routes exclusively to Blink (BOLT11 Lightning).
 *
 * Locked architecture decisions (see claude.md §4a):
 * - BOLT11 via Blink is the sole beta payment path. ZBD permanently retired (CC-11).
 * - BOLT12 abandoned (CC-07) — not implemented behind this interface.
 * - Cashu / NUT-18 ecash is a planned future provider, designed to slot in behind
 *   this interface without requiring changes to the order layer above it.
 *
 * Callers should depend only on this interface's exported functions/types —
 * never import a provider SDK (e.g. Blink GraphQL client) directly outside
 * this file's implementation.
 *
 * @module mintInterface
 *//** mintInterface.ts — Payment provider abstraction layer. Routes payment
instructions to active provider (currently Blink/BOLT11). Cashu/NUT-18 and
BOLT12 slot in behind this interface without touching the order layer.
"Mint" = generic value endpoint, not Cashu-specific. */

// =============================================================
// Refueler · mintInterface.ts — CC-11
// Updated: provider label → 'blink/bolt11' (replaces 'zebedee/bolt11')
// =============================================================

export type PaymentProvider = 'blink/bolt11' | 'cashu/nut18' | 'bolt12'

export interface InvoiceRequest {
  orderId: string
  amountSats: number
  memo?: string
  sandbox?: boolean
}

export interface InvoiceResult {
  paymentRequest: string
  paymentHash: string
  expiresAt: string
  satoshis: number
  provider: PaymentProvider
}

export interface MintInterfaceConfig {
  activeProvider: PaymentProvider
  supabaseUrl: string
  supabaseAnonKey: string
}

// ─── Active provider ─────────────────────────────────────────
// Change this single value to swap the payment backend.
// All order-layer code is insulated from provider details.

export const ACTIVE_PROVIDER: PaymentProvider = 'blink/bolt11'

// ─── Invoice creation ─────────────────────────────────────────

export async function createInvoice(
  req: InvoiceRequest,
  config: MintInterfaceConfig
): Promise<InvoiceResult> {
  switch (config.activeProvider) {
    case 'blink/bolt11':
      return createBlinkBolt11Invoice(req, config)

    case 'cashu/nut18':
      // Slot in NUT-18 provider here without touching order layer
      throw new Error('cashu/nut18 provider not yet wired in this build')

    case 'bolt12':
      // BOLT12 assessed and abandoned for beta — do not reopen
      throw new Error('bolt12 abandoned for beta — use blink/bolt11')

    default:
      throw new Error(`Unknown payment provider: ${config.activeProvider}`)
  }
}

// ─── Blink / BOLT11 implementation ───────────────────────────

async function createBlinkBolt11Invoice(
  req: InvoiceRequest,
  config: MintInterfaceConfig
): Promise<InvoiceResult> {
  const endpoint = `${config.supabaseUrl}/functions/v1/bolt11-create-invoice`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.supabaseAnonKey}`,
    },
    body: JSON.stringify({
      order_id: req.orderId,
      amount_sats: req.amountSats,
      memo: req.memo,
      sandbox: req.sandbox ?? false,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`bolt11-create-invoice error ${res.status}: ${errText}`)
  }

  const data = await res.json()

  return {
    paymentRequest: data.payment_request,
    paymentHash: data.payment_hash,
    expiresAt: data.expires_at,
    satoshis: data.satoshis,
    provider: 'blink/bolt11',
  }
}

// ─── Provider metadata ────────────────────────────────────────

export function providerLabel(provider: PaymentProvider): string {
  const labels: Record<PaymentProvider, string> = {
    'blink/bolt11': 'Blink · BOLT11',
    'cashu/nut18':  'Cashu · NUT-18',
    'bolt12':       'BOLT12',
  }
  return labels[provider] ?? provider
}

export function isProviderActive(provider: PaymentProvider): boolean {
  return provider === ACTIVE_PROVIDER
}
