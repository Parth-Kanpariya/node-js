
import {body, validationResult} from 'express-validator'
const validation = [

    body('password')
        .isLength({ min: 8 })
        .trim()
        .withMessage("Password has to be at least 8 character"),

    body('password')
        .custom((value, { req }) => {
            if (value !== req.body.passwordConfirm) {
                return false
            }
            return true
        }).withMessage("Password don't match")

]
export default {validationResult, validation}




