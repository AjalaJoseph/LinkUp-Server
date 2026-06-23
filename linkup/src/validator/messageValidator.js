import {body, validationResult} from 'express-validator'
export const messageValidator =[
    body('text')
    .trim()
    .notEmpty().withMessage('text feld is required'),
    (req, res, next) =>{
            const error= validationResult(req)
            if(!error.isEmpty()){
                const errorMessage = error.array()[0].msg
                 return res.status(400).json({ status: "fail", message: errorMessage });
            }
            return next()
        }
]