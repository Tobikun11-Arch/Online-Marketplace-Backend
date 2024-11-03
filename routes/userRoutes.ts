import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);

export default router;