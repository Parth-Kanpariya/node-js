import express from "express";
import productController from "../controller/productController.js";
import authController from "../controller/authController.js";

const router = express.Router();
router.get('/product/:id', authController.protect, productController.findById)
router.get("/product", authController.protect, productController.getProduct);
router.post(
  "/addProduct",
  
  productController.addProduct
);
router.get(
  "/product/:category",
 
  productController.findByCategory
);

router.get('/productPage', productController.productpage)


export default router;
