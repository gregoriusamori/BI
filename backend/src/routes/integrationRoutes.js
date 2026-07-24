const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const integrationController = require('../controllers/integrationController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post('/import', authMiddleware, adminOnly, upload.single('file'), integrationController.importCSV);
router.get('/history', authMiddleware, integrationController.getHistory);

module.exports = router;
