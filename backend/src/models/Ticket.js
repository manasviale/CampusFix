import mongoose from 'mongoose';
import { isFallbackActive, LocalTicket } from '../localDb.js';

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 5000
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  image: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Infrastructure', 'Electrical', 'Internet', 'Cleanliness', 'Water', 'Hostel', 'Security', 'Laboratory', 'Library', 'Other'],
    default: 'Other',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    index: true
  },
  department: {
    type: String,
    enum: ['Maintenance', 'IT Department', 'Electrical', 'Hostel Administration', 'Security', 'Administration', 'Housekeeping', 'Library', 'Other'],
    default: 'Other',
    index: true
  },
  aiSummary: String,
  aiSuggestedAction: String,
  status: {
    type: String,
    enum: ['Submitted', 'In Review', 'In Progress', 'Resolved'],
    default: 'Submitted',
    index: true
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  resolvedAt: Date
}, { timestamps: true });

const MongooseTicket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

const Ticket = new Proxy(MongooseTicket, {
  get(target, prop) {
    if (isFallbackActive() && prop in LocalTicket) {
      return LocalTicket[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (isFallbackActive()) {
      return LocalTicket.createLocal(args[0] || {});
    }
    return new target(...args);
  }
});

export default Ticket;
