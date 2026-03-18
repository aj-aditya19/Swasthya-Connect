const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  destination: (req, file, cb) => {
    const userDir = path.join(uploadDir, req.user._id.toString());
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, JPG and PNG files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/*
 * CLOUDINARY VERSION (uncomment to switch):
 *
 * const cloudinary = require('cloudinary').v2;
 * const { CloudinaryStorage } = require('multer-storage-cloudinary');
 *
 * cloudinary.config({
 *   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 *   api_key:    process.env.CLOUDINARY_API_KEY,
 *   api_secret: process.env.CLOUDINARY_API_SECRET,
 * });
 *
 * const cloudStorage = new CloudinaryStorage({
 *   cloudinary,
 *   params: async (req, file) => ({
 *     folder: `medisetu/${req.user._id}`,
 *     allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
 *     resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
 *   }),
 * });
 *
 * const upload = multer({ storage: cloudStorage, limits: { fileSize: 10 * 1024 * 1024 } });
 */

module.exports = upload;
