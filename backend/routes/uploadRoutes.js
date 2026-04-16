import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! Allowed types: .jpg, .jpeg, .png, .webp'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', (req, res) => {
    upload.array('images', 10)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('General Upload Error:', err);
            return res.status(400).json({ message: err.message || 'An unknown error occurred during upload' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded. Make sure the field name is "images".' });
        }

        try {
            const filePaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);
            res.status(200).json(filePaths);
        } catch (mapErr) {
            console.error('Error processing file paths:', mapErr);
            res.status(500).json({ message: 'Error processing uploaded files.' });
        }
    });
});

export default router;
