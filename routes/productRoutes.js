import express from "express";
import productController from "../controller/productController.js";
import authController from "../controller/authController.js";

const router = express.Router();
router.get("/product/:id", authController.protect, productController.findById);
router.get("/products", authController.protect, productController.getProduct);
router.post(
    "/addProduct",
    authController.protect,
    productController.addProduct
);
router.get(
    "/product",
    authController.protect,
    productController.findByCategory
);

router.get("/productPage", productController.productpage);

export default router;