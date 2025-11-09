import fs from "fs";
import csv from "csv-parser";
import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadTransactions = asyncHandler(async (req, res, next) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const filePath = req.file.path;
  const transactions = [];

  try {
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          try {
            // Convert timestamp safely (fixes Invalid Date issue)
            const timestamp = new Date(row.timestamp?.replace(" ", "T"));
            if (isNaN(timestamp.getTime())) {
              console.warn(`⚠️ Skipped invalid date: ${row.timestamp}`);
              return;
            }

            transactions.push({
              transaction_id: row.transaction_id,
              timestamp,
              amount: parseFloat(row.amount) || 0,
              type: row.type || "",
              category: row.category || "",
              user_id: row.user_id || "demo_user",
              is_reckless: row.is_reckless === "true" || row.is_reckless === true,
            });
          } catch (err) {
            console.error("Error parsing row:", err.message);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (transactions.length === 0) {
      throw new ApiError(400, "No valid transactions found in CSV");
    }

    // Insert all transactions
    await Transaction.insertMany(transactions);

    // Delete uploaded file
    fs.unlinkSync(filePath);

    return res.status(200).json(
      new ApiResponse(
        200,
        { count: transactions.length },
        "Transactions uploaded successfully"
      )
    );
  } catch (error) {
    console.error("CSV Upload Error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new ApiError(500, "Failed to process the CSV file");
  }
});

const getTransactions = asyncHandler(async (req, res, next) => {
  const userId = req.params.user_id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: user_id not found");
  }
  
  const transactions = await Transaction.find({ user_id: userId }).lean().sort({ timestamp: -1 });


  return res.status(200).json({
  status: 200,
  data: { transactions },
  message: "Transactions fetched successfully"
});

});

export { uploadTransactions, getTransactions };
