import { Router } from "express";
import { Register, Login, CheckUser } from "../controllers/userController";
import { ProductList, ProductId, Cart, CartProducts, updateQuantity, deleteProduct, UpdateProfile } from "../controllers/buyerController";
import { Get_Product, Update_Product, Update_DraftProduct, Draft_Publish, DeleteProduct, orders_page, SellerData, UpdateSeller } from "../controllers/SellerUser";
import { SearchList, StripePayment, Orders, getOrderHistory } from "../user/userDataHandler"
import { Categories, UserSales } from '../controllers/ProductData'
import { authenticateToken } from "../middleware/AuthenticateAccessToken";
import protectedroute from "./protectedRoutes";

const router = Router();
const protectroute = Router() //use later if all of them are in development (don't use this if its on production only /**token will not read */)
protectedroute.use(authenticateToken)

//Post request
router.post('/register', Register);
router.post('/login', Login);
router.post('/CheckUser', CheckUser);
router.post('/product/cartProducts', CartProducts)
router.post('/StripePayment', StripePayment)
router.post('/product/cart', Cart)
router.post('/post/newpublish', Draft_Publish)

//Put request
router.put('/put/product', Update_Product)
router.put('/put/draftproduct', Update_DraftProduct)
router.put('/Orders', Orders)
router.put('/product/updateQuantity', updateQuantity)
router.put('/UpdateProfile', UpdateProfile)
router.put('/seller_profile', UpdateSeller)
router.put('/searchProduct', SearchList)

//Get request
router.get('/product/:id', ProductId)
router.get('/getOrderHistory', getOrderHistory)
router.get('/SellerProductlist', ProductList)
router.get('/get/product', Get_Product)
router.get('/get/orders', orders_page)
router.get('/sellerdata', SellerData)
router.get('/categories/length', Categories)
router.get('/products/sales', UserSales)

//Delete request
//seller product
router.delete('/delete/product', DeleteProduct)

//buyer product
router.delete('/product/deleteProduct', deleteProduct)


export default router;  