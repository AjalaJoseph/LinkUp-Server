import {body, validationResult} from 'express-validator'
export const postValidator =[
    body('title').trim().notEmpty().withMessage('Post title field is required'),
    body('description').trim().notEmpty().withMessage('Post description field is required'),
    body('city').trim().notEmpty().withMessage('Current city field is required'),
    body('state').trim().notEmpty().withMessage('State field is required'),
    body('helpType')
        .optional()
        .isIn(['PHYSICAL', 'VIRTUAL', 'ANY'])
        .withMessage('Type of help must be exactly PHYSICAL, VIRTUAL, or ANY (uppercase only)'),

    body('tags')
        .notEmpty().withMessage('tags field is required')
        .customSanitizer((value) => {
            // If it arrives as form-data string text, unpack it into a real JavaScript array object
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value; // Leave as string if it can't parse, triggering the error below
                }
            }
            return value;
        }),

        // .isArray({ min: 1, max: 5 })
        // .withMessage('you can only select tag; min of 1 and maximum of 5 '),

        (req, res, next) =>{
            const error= validationResult(req)
            if(!error.isEmpty()){
                const errorMessage = error.array()[0].msg
                 return res.status(400).json({ status: "fail", message: errorMessage });
            }
            return next()
        }

]

// validate search input 
export const validateSearchInput = [
    body('search_input')
    .trim()
    .notEmpty()
    .withMessage("search field is required "),

     (req, res, next) =>{
            const error= validationResult(req)
            if(!error.isEmpty()){
                const errorMessage = error.array()[0].msg
                 return res.status(400).json({ status: "fail", message: errorMessage });
            }
            return next()
        }
]