import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'),
      false
    );
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return cb(
      new Error('Invalid file extension. Only JPG, JPEG, PNG, and WEBP are allowed.'),
      false
    );
  }

  cb(null, true);
};

const createUpload = (folder) =>
  multer({
    storage: createStorage(folder),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
  });

export const postUpload = createUpload('blogging-platform/posts');
export const profileUpload = createUpload('blogging-platform/profiles');

export const handleImageUpload = (uploadInstance, fieldName) => (req, res, next) => {
  uploadInstance.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File too large. Maximum size is 5MB.'
            : `Upload error: ${err.message}`;
        return res.status(400).json({ message });
      }

      return res.status(400).json({
        message: err.message || 'Image upload failed. Please try again.',
      });
    }

    if (req.file) {
      const extension = path.extname(req.file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return res.status(400).json({
          message: 'Invalid file extension. Only JPG, JPEG, PNG, and WEBP are allowed.',
        });
      }
    }

    next();
  });
};

export const uploadPostImage = handleImageUpload(postUpload, 'image');
export const uploadProfileImage = handleImageUpload(profileUpload, 'profilePicture');

export default postUpload;
