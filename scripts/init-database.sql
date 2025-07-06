-- This script initializes the MongoDB collections
-- Note: MongoDB is schemaless, but this shows the expected document structure

-- Users Collection
-- {
--   _id: ObjectId,
--   name: String,
--   email: String (unique),
--   password: String (hashed),
--   createdAt: Date
-- }

-- Transactions Collection
-- {
--   _id: ObjectId,
--   userId: ObjectId (reference to users),
--   description: String,
--   amount: Number (positive for income, negative for expenses),
--   category: String,
--   type: String ("income" or "expense"),
--   date: Date,
--   createdAt: Date,
--   updatedAt: Date (optional)
-- }

-- Sample Categories:
-- "Food & Dining", "Transportation", "Shopping", "Entertainment", 
-- "Bills & Utilities", "Healthcare", "Education", "Travel", "Other"

-- Indexes for better performance:
-- db.users.createIndex({ "email": 1 }, { unique: true })
-- db.transactions.createIndex({ "userId": 1, "date": -1 })
-- db.transactions.createIndex({ "userId": 1, "category": 1 })
-- db.transactions.createIndex({ "userId": 1, "type": 1 })
