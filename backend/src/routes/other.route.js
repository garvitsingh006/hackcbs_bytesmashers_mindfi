import { Router } from "express";
import { processNewTransaction, triggerEmergencyAlert, get_mindfi50_options, updateFund, pmsInvest   } from "../controllers/other.controller.js";
import { chatWithBot } from "../controllers/chatbot.controller.js";

const router = Router();

router.put("/classify", processNewTransaction); //  THE CORE: Executes the entire workflow: Cap Check $\rightarrow$ ML Model $\rightarrow$ DB Save $\rightarrow$ Trigger Emergency.

router.post("/emergency/alert", triggerEmergencyAlert);
router.post("/emergency/updateFund", updateFund)
router.get("/investment/suggest", get_mindfi50_options);
router.post("/chat", chatWithBot); // Chatbot endpoint
router.post("/pms/invest", pmsInvest);

export default router;