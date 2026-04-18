import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ accounts: [], summary: { totalAccounts:0, activeAccounts:0, totalCapital:0, dailyNetIncome:0, monthlyNetIncome:0, annualProjection:0 } })
}

export async function POST() {
  return NextResponse.json({ success: true }, { status: 201 })
}
