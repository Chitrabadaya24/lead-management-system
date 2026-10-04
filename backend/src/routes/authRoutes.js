const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateMeSchema } = require('../middleware/validate');
router.post('/register', validate(registerSchema), c.register);
router.post('/login', validate(loginSchema), c.login);
router.get('/me', protect, c.me);
router.put('/me', protect, validate(updateMeSchema), c.updateMe);
module.exports = router;
