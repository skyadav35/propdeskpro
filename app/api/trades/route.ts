import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET() {
  try {
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ trades: [], stats: emptyStats() })

    const users = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId}`
    if (!users.length) return NextResponse.json({ trades: [], stats: emptyStats() })

    const userId = users[0].id
    const trades = await sql`
      SELECT * FROM "Trade" 
      WHERE "userId" = ${userId} 
      ORDER BY date DESC 
      LIMIT 200
    `

    const wins = trades.filter(t => t.result === 'WIN')
    const losses = trades.filter(t => t.result === 'LOSS')
    const totalPnl = trades.reduce((s, t) => s + Number(t.pnl), 0)
    const winRate = trades.length > 0 ? (wins.length / (wins.length + losses.length || 1)) * 100 : 0
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length) : 0
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
      }
    })
  } catch (error) {
    console.error('GET trades error:', String(error))
    return NextResponse.json({ trades: [], stats: emptyStats() })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { date, instrument, direction, session, entryPrice, exitPrice, lotSize, pnl, result, setup, notes } = body

    let users = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId}`
    if (!users.length) {
      await sql`INSERT INTO "User" (id, "clerkId", email) VALUES (gen_random_uuid()::text, ${clerkId}, '')`
      users = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId}`
    }
    const userId = users[0].id

    const trade = await sql`
      INSERT INTO "Trade" (
        id, "userId", date, instrument, direction, session,
        "entryPrice", "exitPrice", "lotSize", pnl, result, setup, notes, "createdAt"
      ) VALUES (
        gen_random_uuid()::text, ${userId}, ${new Date(date)}, ${instrument},
        ${direction}, ${session || null}, ${entryPrice || null}, ${exitPrice || null},
        ${lotSize || null}, ${pnl}, ${result}, ${setup || null}, ${notes || null}, NOW()
      ) RETURNING *
    `
    return NextResponse.json(trade[0], { status: 201 })
  } catch (error) {
    console.error('POST trades error:', String(error))
    return NextResponse.json({ error: 'Failed to save', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const users = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId}`
    if (!users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await sql`DELETE FROM "Trade" WHERE id = ${id} AND "userId" = ${users[0].id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE trades error:', String(error))
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

function emptyStats() {
  return { total: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0, avgWin: 0, avgLoss: 0, profitFactor: 0 }
}