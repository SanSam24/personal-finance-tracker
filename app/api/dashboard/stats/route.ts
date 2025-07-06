import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) throw new Error("No token provided")

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  return decoded.userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    const { db } = await connectToDatabase()

    const transactions = await db
      .collection("transactions")
      .find({ userId: new ObjectId(userId) })
      .toArray()

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = Math.abs(
      transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    )

    const balance = totalIncome - totalExpenses
    const transactionCount = transactions.length

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      transactionCount,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
