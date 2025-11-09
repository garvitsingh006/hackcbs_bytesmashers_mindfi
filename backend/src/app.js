import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json("limit: 10mb"));
app.use(express.static("public"));
app.use(express.urlencoded({extended: true, limit: "10mb"}));
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// import { Transaction } from "./models/transaction.model.js";

// // Function to delete all transactions
// async function deleteAllTransactions() {
//   try {
//     const result = await Transaction.deleteMany({});
//     console.log(`${result.deletedCount} transactions were removed.`);
//   } catch (error) {
//     console.error('Error deleting transactions:', error);
//   }
// }

// // Call the function
// deleteAllTransactions();


// import routes
import transactionRouter from "./routes/transactions.route.js"
import userRouter from "./routes/user.route.js"
import otherRouter from "./routes/other.route.js"
app.use("/api/v1/transactions", transactionRouter);
app.use('/api/v1/users', userRouter)
app.use("/api/v1/others", otherRouter)

export {app};