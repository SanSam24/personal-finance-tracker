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
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    const { description, amount, category, type, date } = await request.json()

    if (!description || !amount || !category || !type || !date) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const transaction = {
      userId: new ObjectId(userId),
      description,
      amount: Number.parseFloat(amount),
      category,
      type,
      date: new Date(date),
      createdAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return NextResponse.json({ message: "Transaction created successfully", id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
