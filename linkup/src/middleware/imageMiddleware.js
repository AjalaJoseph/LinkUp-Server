import multer from "multer"
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) =>{
    const allowedType =[
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
]
if(allowedType.includes(file.mimetype)){
    cb(null,true);
}
else{
    cb(
        new Error("Only .png, .jpg , .jpeg and .webp  file formats are allowed!"),
        false
    )
}
}

const upload =multer({
    storage:storage,
    limits:{ fileSize: 5 * 1024 * 1024 },
    fileFilter:fileFilter
})

export const uploadImageGuard = (req, res, next) =>{
    upload.single("image")(req, res, (err)=>{
         if (err) {
            return res.status(400).json({
                status: "fail",
                message: err.message || "Image upload failed"
            });
        }
        return next()
    })
}