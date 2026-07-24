const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamicController');
const { authMiddleware } = require('../middleware/auth');

router.get('/tables', dynamicController.listTables);
router.post('/tables', authMiddleware, dynamicController.createTable);
router.get('/tables/:table/info', dynamicController.getTableInfo);
router.delete('/tables/:table', authMiddleware, dynamicController.dropTable);
router.get('/tables/:table', dynamicController.getAll);
router.post('/tables/:table/rows', authMiddleware, dynamicController.insertRow);
router.get('/tables/:table/rows/:id', dynamicController.getById);
router.put('/tables/:table/rows/:id', authMiddleware, dynamicController.updateRow);
router.delete('/tables/:table/rows/:id', authMiddleware, dynamicController.deleteRow);

module.exports = router;
