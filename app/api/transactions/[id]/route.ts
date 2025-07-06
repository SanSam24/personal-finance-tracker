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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(request)
    const { description, amount, category, type, date } = await request.json()
    const { db } = await connectToDatabase()

    const result = await db.collection("transactions").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          description,
          amount: Number.parseFloat(amount),
          category,
          type,
          date: new Date(date),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Transaction updated successfully" })
  } catch (error) {
    console.error("Update transaction error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(request)
    const { db } = await connectToDatabase()

    const result = await db.collection("transactions").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
