import express, { Router } from "express";
import { authenticateToken } from "../middleware/AuthenticateAccessToken";
import User from "../models/user"; 
import productlist from "../models/product"; 
import Product from "../models/product"; 
import { Request, Response } from "express";

interface RequestWithUser extends Request {

    user?: any;
    product?: any;

  } 

const protectedroute = Router();
protectedroute.use(authenticateToken);

protectedroute.get('/dashboard', async (req: RequestWithUser, res: Response) => {
    const userEmail = req.user?.Email;

    try {
      let user = await User('buyer').findOne({ Email: userEmail.toLowerCase() });

      if (!user) {
          user = await User('seller').findOne({ Email: userEmail.toLowerCase() });
      }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `Welcome, ${user.FirstName}!`, user: { FirstName: user.FirstName, LastName: user.LastName, Email: user.Email, userId: user._id } });
    } 
    
    catch (error) {

        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
});


protectedroute.post('/UploadProducts', async (req:RequestWithUser, res: Response) => {
    try {
        const {
          userId,
          productName,
          productDescription,
          productCategory,
          status,
          Sku,
          productPrice,
          productStock,
          productDiscount,
          productQuality,
          productSize,
          images,
        } = req.body
        if(!userId) { return res.status(404).json({ message: "userId not found" }) }

        const sellerProducts = {
          productName,
          productDescription,
          productCategory,
          status,
          Sku,
          productPrice,
          productStock,
          productDiscount,
          productQuality,
          productSize,
          images
        }

        const result = await User('seller').updateOne(
          { _id: userId },
          { $addToSet: { sellerProducts: sellerProducts } }
        )

        if(result.modifiedCount > 0) {
          return res.status(200).json({ message: "Successfully added" })
        }

        else{
          return res.status(400).json({ messsage: "Failed to add" })
        }

    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal server error'});
    }
})

protectedroute.post('/DraftProducts', async (req:RequestWithUser, res: Response) => {
  try {
      const {
        userId,
        productName,
        productDescription,
        productCategory,
        Sku,
        productPrice,
        productStock,
        productDiscount,
        productQuality,
        productSize,
        images,
      } = req.body
      if(!userId) { return res.status(404).json({ message: "userId not found" }) }

      const draftProducts = {
        productName,
        productDescription,
        productCategory,
        Sku,
        productPrice,
        productStock,
        productDiscount,
        productQuality,
        productSize,
        images
      }

      const result = await User('seller').updateOne(
        { _id: userId },
        { $addToSet: { draftProducts: draftProducts } }
      )

      if(result.modifiedCount > 0) {
        return res.status(200).json({ message: "Successfully added" })
      }

      else{
        return res.status(400).json({ messsage: "Failed to add" })
      }

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error'});
  }
})

protectedroute.post('/Products', async (req: RequestWithUser, res: Response) => {
    const userId = req.user?._id;
    const token = req.cookies['accessToken']; 
    try {
    const {
      productId,
      productName, 
      productDescription, 
      productCategory, 
      productQuality, 
      productQuantity, 
      Sku, 
      productSize,
      productPrice,
      productDiscount,
      productWeight, 
      images,
      status,
      ScheduleDate,
      Featured
    } = req.body;

    if(productId) {
      const updateProduct = await Product.findByIdAndUpdate (
        productId,
        {
        productName, 
        productDescription, 
        productCategory, 
        productQuality, 
        productQuantity, 
        Sku, 
        productSize,
        productPrice,
        productDiscount,
        productWeight, 
        images,
        status
        },
        {new: true}
      )

      if (!updateProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ message: 'Product successfully updated', product: updateProduct });
    }

    else {
      const Products = new Product({
          userId,
          productName, 
          productDescription, 
          productCategory, 
          productQuality, 
          productQuantity, 
          Sku, 
          productSize,
          productPrice,
          productDiscount,
          productWeight, 
          images,
          status,
          ScheduleDate,
          Featured
      });

      await Products.save();
      res.status(201).json({ message: 'Product successfuly added' });
      } 
    }

    catch (error) {
      console.error('Error creating product:', error, token);
      res.status(500).json({ error: 'Internal server error' });
    }
}); 

protectedroute.post('/Products/Delete', async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id;

  try {
    const { productId } = req.body

    if (!productId || productId.length === 0) {
      return res.status(400).json({ message: 'No product IDs provided' });  
    }

    const result = await Product.deleteMany({ _id: { $in: productId }, userId });

    if(result.deletedCount > 0) {
      return res.status(200).json({ message: 'Products deleted successfully' });
    }

  } catch (error) {
    console.error("Error")
  }
})

protectedroute.get('/productList', async (req: RequestWithUser, res: Response) => {
    const userId = req.user?._id;
  
    try {
      const productList = await productlist.find({ userId: userId });
  
      if (productList.length === 0) {
        return res.json({ ProductLists: [] });
      }
  
      const ProductLists = productList.map((list) => ({
        productId: list._id,
        productName: list.productName,
        productStatus: list.status,
        productPrice: list.productPrice,
        images: list.images,
        description: list.productDescription,
        productQuantity: list.productQuantity,
        createdAt: list.createdAt,
        productDiscount: list.productDiscount,
        Featured: list.Featured,
        productQuality: list.productQuality,
        productCategory: list.productCategory,
        productSize: list.productSize,
        productDescription: list.productDescription,
        Sku: list.Sku,
        productweight: list.productWeight
      }));

      res.json({ ProductLists });
    } 
    catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export default protectedroute;