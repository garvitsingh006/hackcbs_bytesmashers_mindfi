import { Router } from "express";
import { getCaps, updateIncomeAndCaps } from "../controllers/user.controller.js";
const router = Router();

router.get("/caps/:user_id", getCaps);
router.put("/caps", updateIncomeAndCaps); // Not now
    
export default router;