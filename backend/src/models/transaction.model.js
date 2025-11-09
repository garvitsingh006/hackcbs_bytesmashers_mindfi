import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user_id: { type: String },
    transaction_id: String,
    timestamp: Date,
    type: String,
    category: String,
    amount: Number,
    is_reckless: Boolean
});

export const Transaction =  mongoose.model("Transaction", transactionSchema);