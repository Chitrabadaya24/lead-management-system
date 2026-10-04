const router = require('express').Router();
const { protect } = require('../middleware/auth');
router.get('/', protect, require('../controllers/authController').listUsers);
module.exports = router;
