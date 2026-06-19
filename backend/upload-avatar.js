const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Cấu hình lưu ảnh vào thư mục public/images/avatars/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
  }

  const filePath = `/images/avatars/${req.file.filename}`;
  return res.json({ success: true, filePath });
});

module.exports = router;
