import mongoose, {Schema} from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: { type: String, unique: true },
    balance: Number,
    monthly_income: Number,
    weekly_cap: Number,
    max_single_spend: Number,
    emergency_fund: Number,
    category_caps: {type: Map, of: Number},
});

export const User = mongoose.model("User", userSchema);