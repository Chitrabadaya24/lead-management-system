const Joi = require('joi');
const { STATUSES, SOURCES, CUSTOMER_TYPES } = require('../config/constants');
const oid = Joi.string().hex().length(24);
const optDate = Joi.date().allow(null, '');
const optStr = (max) => Joi.string().max(max).allow('', null);
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required(),
});
exports.loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
exports.updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(72).allow(''),
  currentPassword: Joi.string().allow(''),
}).or('name', 'email', 'password');
exports.leadSchema = Joi.object({
  leadName: Joi.string().max(100).required(),
  contactNumber: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).required().messages({ 'string.pattern.base': 'contactNumber must be 7-15 digits' }),
  email: Joi.string().email().allow('', null),
  address: optStr(300),
  status: Joi.string().valid(...STATUSES),
  assignedTo: oid.allow('', null),
  nextFollowUpDate: optDate,
  nextFollowUpTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).allow('', null),
  leadSource: Joi.string().valid(...SOURCES),
  conversionDate: optDate,
  leadNotes: optStr(2000),
  customerType: Joi.string().valid(...CUSTOMER_TYPES),
  purchaseHistory: Joi.array().items(Joi.object({ item: Joi.string().max(120).required(), amount: Joi.number().min(0), date: optDate })),
  medicalNeeds: optStr(1000),
});
exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: 'Validation failed', errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') })) });
  }
  req.body = value;
  next();
};
