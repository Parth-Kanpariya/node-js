const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')
const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.patch('/updateMe',authController.protect, userController.updateMe)
router.delete('/deleteMe',authController.protect, userController.deleteMe)

router
    .route('/users')
    .get(userController.getAllUser)

//     .post(userControllr.createUser)

// router
//     .router('/:id')
//     .get(userControllr.getUser)
//     .patch(userController.updateUser)
//     .delete(userControllr.deleteUser)

module.exports = router