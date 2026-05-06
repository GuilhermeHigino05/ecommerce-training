import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'src/public/img');
    },
    filename: (req,file,cb) => {
        
        const nameFile = Date.now().toString() + '_' + file.originalname;
        cb(null, nameFile);
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;