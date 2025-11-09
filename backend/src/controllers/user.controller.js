import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /caps - Get caps for current user
const getCaps = asyncHandler(async (req, res, next) => {
    const userId = req.params.user_id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: user_id not found");
    }

    // Fetch user fields
    const user = await User.findOne({ user_id: userId }).select(
        "monthly_income weekly_cap max_single_spend category_caps balance -_id"
    );

    if (!user) throw new ApiError(404, "User not found");

    // Calculate total spent by this user (use userId, not "U001")
    const totalSpentAgg = await Transaction.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSpent = totalSpentAgg[0]?.total || 0;
    const savings = user.monthly_income - totalSpent;

    // Final data object you asked for
    const data = {
        monthly_income: user.monthly_income,
        weekly_cap: user.weekly_cap,
        max_single_spend: user.max_single_spend,
        category_caps: user.category_caps,
        balance: user.balance,
        total_spent: totalSpent,
        savings: savings < 0 ? 0 : savings, // no negative savings — grow up
    };
    console.log(data)
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json(new ApiResponse(200, data));
});

// PUT /caps - Update income and caps for current user
const updateIncomeAndCaps = asyncHandler(async (req, res, next) => {
    const userId = req.params.user_id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: user_id not found");
    }

    const { monthly_income, weekly_cap, max_single_spend, category_caps } =
        req.body;

    // Validate fields as required (example: category_caps should be object/map)
    if (category_caps && typeof category_caps !== "object") {
        throw new ApiError(400, "`category_caps` must be an object/map");
    }

    const update = {};
    if (monthly_income !== undefined) update.monthly_income = monthly_income;
    if (weekly_cap !== undefined) update.weekly_cap = weekly_cap;
    if (max_single_spend !== undefined)
        update.max_single_spend = max_single_spend;
    if (category_caps !== undefined) update.category_caps = category_caps;

    const user = await User.findOneAndUpdate({ user_id: userId }, update, {
        new: true,
    }).select("monthly_income weekly_cap max_single_spend category_caps -_id");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json(new ApiResponse(200, user));
});

export { getCaps, updateIncomeAndCaps };
