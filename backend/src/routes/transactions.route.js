import { Router } from "express";
import multer from "multer";
import { uploadTransactions, getTransactions } from "../controllers/transactions.controller.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadTransactions);
router.get("/get/:user_id", getTransactions);
    
export default router;