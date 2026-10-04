const Lead = require('../models/Lead');
const AppError = require('../utils/AppError');
const { SORT_FIELDS } = require('../config/constants');
const visibility = (u) => (u.role === 'admin' ? {} : { $or: [{ assignedTo: u._id }, { createdBy: u._id }] });
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const POPULATE = { path: 'assignedTo', select: 'name email' };

exports.list = async (q, user) => {
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 10, 1), 50);
  const and = [visibility(user)];
  ['status', 'leadSource', 'customerType'].forEach((k) => q[k] && and.push({ [k]: { $in: String(q[k]).split(',') } }));
  if (q.assignedTo) and.push({ assignedTo: q.assignedTo });
  if (q.search) {
    const r = new RegExp(escapeRegex(String(q.search)), 'i');
    and.push({ $or: [{ leadName: r }, { email: r }, { contactNumber: r }] });
  }
  const sortBy = SORT_FIELDS.includes(q.sortBy) ? q.sortBy : 'createdAt';
  const sort = { [sortBy]: q.order === 'asc' ? 1 : -1, _id: 1 };
  const filter = { $and: and };
  const [data, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate(POPULATE).lean(),
    Lead.countDocuments(filter),
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
};

exports.getById = async (id, user) => {
  const lead = await Lead.findOne({ $and: [{ _id: id }, visibility(user)] }).populate(POPULATE);
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const normalize = (d) => {
  const out = { ...d };
  ['nextFollowUpDate', 'conversionDate', 'assignedTo'].forEach((k) => { if (out[k] === '') out[k] = null; });
  if (out.status === 'converted' && !out.conversionDate) out.conversionDate = new Date();
  return out;
};

exports.create = async (data, user) => {
  const payload = normalize(data);
  if (user.role !== 'admin' || !payload.assignedTo) payload.assignedTo = user._id;
  const lead = await Lead.create({ ...payload, createdBy: user._id });
  return lead.populate(POPULATE);
};

exports.update = async (id, data, user) => {
  const lead = await exports.getById(id, user);
  const payload = normalize(data);
  if (user.role !== 'admin') delete payload.assignedTo;
  lead.set(payload);
  await lead.save();
  return lead.populate(POPULATE);
};

exports.remove = async (id, user) => { const lead = await exports.getById(id, user); await lead.deleteOne(); };

exports.stats = async (user) => {
  const rows = await Lead.aggregate([{ $match: visibility(user) }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const total = rows.reduce((s, r) => s + r.count, 0);
  return { total, byStatus, conversionRate: total ? Math.round(((byStatus.converted || 0) / total) * 100) : 0 };
};

// Overdue + due today/tomorrow, excluding closed leads
exports.reminders = async (user) => {
  const end = new Date(); end.setDate(end.getDate() + 1); end.setHours(23, 59, 59, 999);
  return Lead.find({ $and: [visibility(user), { nextFollowUpDate: { $lte: end }, status: { $nin: ['converted', 'lost'] } }] })
    .sort({ nextFollowUpDate: 1, nextFollowUpTime: 1 }).limit(20).populate(POPULATE).lean();
};
