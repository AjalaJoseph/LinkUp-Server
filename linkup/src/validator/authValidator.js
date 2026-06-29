import {body, validationResult} from 'express-validator'
export const registerValidator = [
    body("name")
    .trim()
    .notEmpty().withMessage('Name field is required')
    .isLength({min:3}).withMessage('Name must be at least 3 characters'),
    // validate email
    body("email")
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail().withMessage("Invalid Email format"),
    // validate password
    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isStrongPassword()
    .withMessage("password must be at least 8 characters including 1 lower case 1 upper case, 1 number and 1 symbol")
]
export const validateRegisterInput =(req, res, next) =>{
    const error = validationResult(req)
    if(!error.isEmpty()){
        const errorMessage = error.array()[0].msg
        return res.status(400).json({
            status:"fail",
            message:errorMessage
        })
    }
    return next()
}

export const loginValidator = [
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email field is required')
    .isEmail().withMessage('Invalid email format'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('password field is required')
]

export const validateLoginInput = (req, res, next) =>{
    const error = validationResult(req)
    if(!error.isEmpty()){
        const errorMessage = error.array()[0].msg
        return res.status(400).json({
            status:"fail",
            message:errorMessage
        })
    }
    return next()
}

// validate user profile data
export const updateProfileValidator = [
    body('state')
    .trim()
    .notEmpty().withMessage('state field is required'),
    body('city')
    .trim()
    .notEmpty().withMessage('city field is required'),
    body('bio')
    .trim()
    .notEmpty().withMessage("bio field is required")
    .isLength({max:200}).withMessage("Bio must not exceed 200 characters"),
    body('skills')
    .trim()
    .isArray({min:1, max:5})
    .withMessage("Skills must contain between 1 and 5 items"),

    (req, res, next) =>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const errorMessage = errors.array()[0].msg
            return res.status(400).json({
                status:"fail",
                message:errorMessage
            })
        } 
        return next()
    }
]
//  change password validator
export const changePasswordValidator = [
    body('old_password')
    .trim()
    .notEmpty().withMessage('Old password field is required'),
    body('new_password')
    .trim()
    .notEmpty().withMessage('New password field is required')
    .isStrongPassword()
    .withMessage("password must be at least 8 characters including 1 lower case 1 upper case, 1 number and 1 symbol"),

    (req, res, next) =>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const errorMessage = errors.array()[0].msg
            return res.status(400).json({
                status:"fail",
                message:errorMessage
            })
        } 
        return next()
    }
]

//  forgot password email validator
export const ValidateForgotPasswordEmail = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage('Email field is required')
    .isEmail().withMessage('Invalid email format'),
      (req, res, next) =>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const errorMessage = errors.array()[0].msg
            return res.status(400).json({
                status:"fail",
                message:errorMessage
            })
        } 
        return next()
    }
]

export const ValidateResetPasswordInput = [
    body("otpCode")
    .trim()
    .notEmpty()
    .withMessage('otpCode field is required'),
    body('new_password')
    .trim()
    .notEmpty().withMessage('New password field is required')
    .isStrongPassword()
    .withMessage("password must be at least 8 characters including 1 lower case 1 upper case, 1 number and 1 symbol"),
   
      (req, res, next) =>{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const errorMessage = errors.array()[0].msg
            return res.status(400).json({
                status:"fail",
                message:errorMessage
            })
        } 
        return next()
    }
]