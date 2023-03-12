import express from "express";
import categoryController from "../controller/categoryController.js";
import authController from "../controller/authController.js";
const router = express.Router();

router
    .route("/category")
    .get(categoryController.getCategories)
    .post(categoryController.addCategories);

router.delete(
    "/category",
    categoryController.deleteCategory
);
router.put(
    "/category/:id",
    categoryController.updateCategory
);

export default router;