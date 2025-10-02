const multer = require('multer');
const { put } = require('@vercel/blob');

const upload = multer({
  storage: multer.memoryStorage(),
});

exports.saveToBlob = async (req, res, next) => {
  try {
    if (req.files && req.files.universityIdCard) {
      const file = req.files.universityIdCard[0];
      const { url } = await put(`${Date.now()}-${file.originalname}`, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true,
      });
      req.files.universityIdCard[0].key = url;
      console.log(`Uploaded to Blob: ${url}`);
    } else {
      return res.status(400).json({ message: 'No universityIdCard file provided' });
    }
    next();
  } catch (error) {
    console.error('Blob upload error:', error);
    res.status(500).json({ message: 'File upload error', error: error.message });
  }
};

exports.default = upload.fields([
  { name: 'universityIdCard', maxCount: 1 },
]);