import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { spawn } from "child_process";
import {User} from "../models/user.model.js";
const MONTHLY_CAP = 100000;

const processNewTransaction = asyncHandler(async (req, res, next) => {
    const { user_id, amount, timestamp, category } = req.body;

    if (!user_id || !amount || !timestamp || !category) {
        throw new ApiError(400, "user_id, amount, timestamp, and category are required");
    }

    // Fetch user caps
    const user = await User.findOne({ user_id });
    if (!user) throw new ApiError(404, "User not found");

    const categoryCap = user.category_caps?.get(category);

    let isReckless = false;
    let monthlyCapExceeded = false;

    // 1️⃣ Category Cap Check
    if (categoryCap && amount > categoryCap) {
        isReckless = true;
        console.log(`Category cap exceeded for ${category}. Cap: ${categoryCap}, Spent: ${amount}`);
    }

    // 2️⃣ Monthly Cap Check — do NOT block, just mark
    const startOfMonth = new Date(timestamp);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const spentThisMonthAgg = await Transaction.aggregate([
        { $match: { user_id, timestamp: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = (spentThisMonthAgg[0]?.total || 0) + amount;
    if (totalSpent > MONTHLY_CAP) {
        monthlyCapExceeded = true;
        isReckless = true; // monthly overspend is reckless too
        console.log(`Monthly cap exceeded for user ${user_id}. Cap: ${MONTHLY_CAP}, New Total: ${totalSpent}`);
    }

    // 3️⃣ ML check only if still not reckless
    if (!isReckless) {
        const prediction = await new Promise((resolve, reject) => {
            const jsonString = JSON.stringify(req.body);
            const process = spawn("python", ["ml_model.py", jsonString]);

            let output = "";
            let error = "";

            process.stdout.on("data", (data) => (output += data.toString()));
            process.stderr.on("data", (data) => (error += data.toString()));

            process.on("close", (code) => {
                if (code !== 0) return reject(new Error(error || "ML prediction failed"));
                resolve(output.trim());
            });
        });

        if (prediction === "Reckless") isReckless = true;
    }

    req.body.is_reckless = isReckless;

    await Transaction.create(req.body);

    if (isReckless) {
        console.log("Triggering emergency protocol for user:", user_id);
    }

    res.status(201).json(
        new ApiResponse(201, {
            is_reckless: isReckless,
            monthlyCapExceeded,
            saved: true
        })
    );
});


const triggerEmergencyAlert = asyncHandler(async (req, res, next) => {
    const { user_id, amount, emergency_reason } = req.body;

    if (!user_id || !amount || !emergency_reason) {
        throw new ApiError(400, "user_id, amount and emergency_reason are required");
    }

    const realEmergencyKeywords = ["hospital", "medical", "accident", "icu", "surgery"];
    const isRealEmergency = realEmergencyKeywords.some(word =>
        emergency_reason.toLowerCase().includes(word)
    );

    if (isRealEmergency) {
        return res.status(200).json(
            new ApiResponse(200, {
                approved: true,
                override: "Auto-approved (Real Emergency)",
            })
        );
    }

    // Hardcoded “send to family”
    const familyContact = {
        name: "Mom",
        phone: "+91XXXXXXXXXX",
        relation: "Mother"
    };

    return res.status(200).json(
        new ApiResponse(200, {
            approved: false,
            override: "Waiting for Family Approval",
            sent_to: familyContact,
            message: `Approval request sent to ${familyContact.name}`
        })
    );
});

const get_mindfi50_options = asyncHandler(async (req, res, next) => {
    const { amount } = req.body;

    const redirectAmount = Number(amount) || 1000;
    const projectedGrowth = Math.round(redirectAmount * 0.14);
    const projectedValue = redirectAmount + projectedGrowth;

    return res.status(200).json(
        new ApiResponse(200, {
            suggested_redirect_amount: redirectAmount,
            plan_name: "MindFi50",
            projected_value_after_6_months: projectedValue,
            return_rate: "~14% in 6 months",
            risk_level: "Low",
            message: `Redirect ₹${redirectAmount} to MindFi50 instead? Potential ₹${projectedGrowth} growth in 6 months.`
        })
    );
});

const updateFund = asyncHandler(async (req, res, next) => {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
        throw new ApiError(400, "user_id and amount are required");
    }

    const user = await User.findOne({ user_id });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.emergency_fund = (user.emergency_fund || 0) + Number(amount);
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {
            updated_fund: user.emergency_fund,
            added: Number(amount),
            message: `₹${amount} added to emergency fund`
        })
    );

})

const  pmsInvest = asyncHandler(async (req, res, next) => {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
        throw new ApiError(400, "user_id and amount are required");
    }

    const user = await User.findOne({ user_id });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.pms_investment = (user.pms_investment || 0) + Number(amount);
    user.balance = user.balance - Number(amount);
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {
            updated_investment: user.pms_investment,
            added: Number(amount),
            message: `₹${amount} added to PMS investment`
        })
    );
})

export { processNewTransaction, triggerEmergencyAlert, get_mindfi50_options, updateFund, pmsInvest };
