// app/api/trades/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const TradeSchema = z.object({
  date: z.string(),
  instrument: z.string().min(1),
  direction: z.enum(['LONG', 'SHORT']),
  session: z.enum(['LONDON', 'NEW_YORK', 'ASIAN', 'OVERLAP']).optional(),
  entryPrice: z.number().optional(),
  exitPrice: z.number().optional(),
  lotSize: z.number().optional(),
  pnl: z.number(),
  result: z.enum(['WIN', 'LOSS', 'BREAKEVEN']),
  setup: z.string().optional(),
  notes: z.string().optional(),
  riskReward: z.number().optional(),
  challengeId: z.string().optional(),
})

// GET /api/trades — fetch all trades for authenticated user
export async function GET(req: NextRequest) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const challengeId = searchParams.get('challengeId')
  const limit = parseInt(searchParams.get('limit') ?? '100')

  const trades = await db.trade.findMany({
    where: {
      userId: user.id,
      ...(challengeId ? { challengeId } : {}),
    },
    orderBy: { date: 'desc' },
    take: limit,
  })

  // Compute stats
  const wins = trades.filter(t => t.result === 'WIN')
  const losses = trades.filter(t => t.result === 'LOSS')
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
  const winRate = trades.length > 0 ? (wins.length / (wins.length + losses.length)) * 100 : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0
  const profitFactor = avgLoss > 0 ? (wins.length * avgWin) / (losses.length * avgLoss) : 0

  return NextResponse.json({
    trades,
    stats: {
      total: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
    },
  })
}

// POST /api/trades — create a new trade
export async function POST(req: NextRequest) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TradeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid trade data', details: parsed.error.flatten() }, { status: 400 })
  }

  // Upsert user (in case they signed up via Clerk but haven't hit DB yet)
  const user = await db.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email: '' },
  })

  const trade = await db.trade.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      userId: user.id,
    },
  })

  return NextResponse.json(trade, { status: 201 })
}
