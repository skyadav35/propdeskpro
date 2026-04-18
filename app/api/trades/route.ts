import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ trades: [], stats: { total:0, wins:0, losses:0, winRate:0, totalPnl:0, avgWin:0, avgLoss:0, profitFactor:0 } })
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  return NextResponse.json({ ...body, id: Date.now().toString() }, { status: 201 })
}
