import express from "express";
import categoryController from "../controller/categoryController.js";
import authController from "../controller/authController.js";
const router = express.Router();

router
  .route("/category")
  .get(authController.protect, categoryController.getCategories)
  .post(authController.protect, categoryController.addCategories);

router.delete(
  "/category/:category",
  authController.protect,
  categoryController.deleteCategory
);
router.put(
  "/category/:id",
  authController.protect,
  categoryController.updateCategory
);

export default router;
