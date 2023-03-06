const express = require('express')
const userController = require('../controller/userController')
const authController = require('../controller/authController')
const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)


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