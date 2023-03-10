import express from "express";
import authController from "../controller/authController.js";
import validation from '../middleware/authMiddleware.js'
const router = express.Router();

router.get("/registration", authController.registration);
router.post("/signup",validation.validation, authController.signup);

router.post("/", authController.protect, authController.login);


router.get("/get_login", authController.getLogin);
router.post("/login", authController.login);
export default router;
