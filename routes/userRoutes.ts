import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { ProductList, ProductId } from "../controllers/buyerController";
const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.get('/SellerProductlist', ProductList)
router.get('/product/:id', ProductId)
export default router;  