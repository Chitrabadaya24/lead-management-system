const service = require('../services/leadService');
const asyncHandler = require('../utils/asyncHandler');
exports.list = asyncHandler(async (req, res) => res.json(await service.list(req.query, req.user)));
exports.get = asyncHandler(async (req, res) => res.json({ data: await service.getById(req.params.id, req.user) }));
exports.create = asyncHandler(async (req, res) => res.status(201).json({ data: await service.create(req.body, req.user) }));
exports.update = asyncHandler(async (req, res) => res.json({ data: await service.update(req.params.id, req.body, req.user) }));
exports.remove = asyncHandler(async (req, res) => { await service.remove(req.params.id, req.user); res.status(204).end(); });
exports.stats = asyncHandler(async (req, res) => res.json({ data: await service.stats(req.user) }));
exports.reminders = asyncHandler(async (req, res) => res.json({ data: await service.reminders(req.user) }));
