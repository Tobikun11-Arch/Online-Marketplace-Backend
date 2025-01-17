import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { ProductList, ProductId, CategoryLength, Cart, CartProducts, updateQuantity, deleteProduct, UpdateProfile } from "../controllers/buyerController";
import { Get_Product } from "../controllers/SellerUser";
import { SearchList, StripePayment, Orders, getOrderHistory } from "../user/userDataHandler"
import { authenticateToken } from "../middleware/AuthenticateAccessToken";
import protectedroute from "./protectedRoutes";

const router = Router();
const protectroute = Router() //use later if all of them are in development (don't use this if its on production only /**token will not read */)
protectedroute.use(authenticateToken)

router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.get('/SellerProductlist', ProductList)
router.get('/get/product', Get_Product)
router.get('/product/length', CategoryLength)
router.post('/product/cartProducts', CartProducts)
router.put('/searchProduct', SearchList)
router.post('/StripePayment', StripePayment)
router.put('/Orders', Orders)
router.get('/getOrderHistory', getOrderHistory)
router.put('/product/updateQuantity', updateQuantity)
router.put('/UpdateProfile', UpdateProfile)
router.delete('/product/deleteProduct', deleteProduct)
router.post('/product/cart', Cart)
router.get('/product/:id', ProductId)
export default router;  