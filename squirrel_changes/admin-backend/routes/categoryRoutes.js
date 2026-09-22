const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware'); // adjust import path if different

router.use(protect); // all category routes require admin auth

router.get('/', ctrl.getCategories);
router.post('/', ctrl.createCategory);
router.put('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
