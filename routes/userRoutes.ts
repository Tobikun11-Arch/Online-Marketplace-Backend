import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { ProductList } from "../controllers/buyerController";
const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.get('/SellerProductlist', ProductList)
export default router;