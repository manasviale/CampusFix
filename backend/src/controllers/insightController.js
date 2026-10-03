import Ticket from '../models/Ticket.js';
import { generateInsights as generateAI } from '../services/aiService.js';

async function gatherTicketData() {
  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: { $ne: 'Resolved' } });
  
  const statusCounts = await Ticket.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  
  const categoryCounts = await Ticket.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  
  const priorityCounts = await Ticket.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);
  
  const departmentCounts = await Ticket.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } }
  ]);

  const recentTickets = await Ticket.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title category priority department status');

  return {
    totalTickets,
    totalOpen: openTickets,
    statuses: statusCounts.map(c => ({ name: c._id, count: c.count })),
    categories: categoryCounts.map(c => ({ name: c._id, count: c.count })),
    priorities: priorityCounts.map(c => ({ name: c._id, count: c.count })),
    departments: departmentCounts.map(c => ({ name: c._id, count: c.count })),
    recentTickets
  };
}

export async function getInsights(req, res, next) {
  try {
    const data = await gatherTicketData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function generateAIInsights(req, res, next) {
  try {
    const data = await gatherTicketData();
    const insights = await generateAI(data);
    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
}
