import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { SellerProductlist } from "../controllers/buyerController";
const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.get('/SellerProductlist', SellerProductlist)
export default router;