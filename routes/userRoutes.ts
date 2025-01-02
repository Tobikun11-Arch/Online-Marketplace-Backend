import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { ProductList, ProductId, CategoryLength, Cart, CartProducts, updateQuantity, deleteProduct, UpdateProfile } from "../controllers/buyerController";
import { SearchList, StripePayment, Orders } from "../user/userDataHandler"
const router = Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.get('/SellerProductlist', ProductList)
router.get('/product/length', CategoryLength)
router.post('/product/cartProducts', CartProducts)
router.put('/searchProduct', SearchList)
router.post('/StripePayment', StripePayment)
router.put('/Orders', Orders)
router.put('/product/updateQuantity', updateQuantity)
router.put('/UpdateProfile', UpdateProfile)
router.delete('/product/deleteProduct', deleteProduct)
router.post('/product/cart', Cart)
router.get('/product/:id', ProductId)
export default router;  