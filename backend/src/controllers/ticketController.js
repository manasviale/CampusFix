import Ticket from '../models/Ticket.js';
import Upvote from '../models/Upvote.js';
import { classifyComplaint, checkDuplicateComplaint } from '../services/aiService.js';

export async function getTickets(req, res, next) {
  try {
    const { search, category, priority, department, status, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;
    if (status) filter.status = status;

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'mostUpvoted' || sort === 'mostAffected') sortOptions = { upvoteCount: -1 };
    
    let tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (sort === 'highestPriority') {
      const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      tickets = tickets.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    const total = await Ticket.countDocuments(filter);

    let userUpvotedTicketIds = new Set();
    if (req.user && req.user._id && tickets.length > 0) {
      try {
        const ticketIds = tickets.map(t => String(t._id || t.id));
        const upvotes = await Upvote.find({
          user: req.user._id,
          ticket: { $in: ticketIds }
        });
        if (Array.isArray(upvotes)) {
          userUpvotedTicketIds = new Set(upvotes.map(u => String(u.ticket)));
        }
      } catch (err) {
        console.error('Failed to load user upvotes for ticket list:', err);
      }
    }

    const ticketsWithStatus = tickets.map(t => {
      const doc = typeof t.toJSON === 'function' ? t.toJSON() : { ...t };
      const hasUpvoted = userUpvotedTicketIds.has(String(doc._id || doc.id));
      return {
        ...doc,
        hasUpvoted,
        isAffected: hasUpvoted,
        affectedCount: doc.upvoteCount || 0
      };
    });

    res.status(200).json({
      success: true,
      data: ticketsWithStatus,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const upvote = await Upvote.findOne({ user: req.user._id, ticket: ticket._id });
    const isAffected = !!upvote;
    const ticketJson = typeof ticket.toJSON === 'function' ? ticket.toJSON() : { ...ticket };
    
    res.status(200).json({
      success: true,
      data: {
        ...ticketJson,
        hasUpvoted: isAffected,
        isAffected,
        affectedCount: ticketJson.upvoteCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req, res, next) {
  try {
    const { title, description, location, category } = req.body;
    const aiResult = await classifyComplaint(title, description);
    const allowedCategories = Ticket.schema?.path?.('category')?.enumValues;

    const ticket = new Ticket({
      title,
      description,
      location,
       createdBy: req.user._id,
      category:
        category && (!allowedCategories || allowedCategories.includes(category))
          ? category
          : aiResult.category,
      priority: aiResult.priority,
      department: aiResult.department,
      aiSummary: aiResult.summary,
      aiSuggestedAction: aiResult.suggestedAction
    });

    if (req.file) {
      ticket.image = req.file.filename;
    }

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populatedTicket });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updates = ['status', 'category', 'priority', 'department', 'aiSummary', 'aiSuggestedAction'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        ticket[field] = req.body[field];
      }
    });

    if (req.body.status === 'Resolved') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req, res, next) {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    await Upvote.deleteMany({ ticket: req.params.id });

    res.status(200).json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    next(error);
  }
}

export async function checkDuplicateTicket(req, res, next) {
  try {
    const { title, description, location, category } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(200).json({
        success: true,
        isDuplicate: false,
        duplicateTicket: null,
        similarTickets: [],
        message: 'Provide more detail to check for duplicates.'
      });
    }

    // Retrieve open/unresolved tickets
    const openTickets = await Ticket.find({ status: { $ne: 'Resolved' } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (!openTickets || openTickets.length === 0) {
      return res.status(200).json({
        success: true,
        isDuplicate: false,
        duplicateTicket: null,
        similarTickets: [],
        message: 'No open complaints in the system.'
      });
    }

    // Attach user's affected status to candidate tickets
    let userUpvotedTicketIds = new Set();
    if (req.user && req.user._id) {
      try {
        const ticketIds = openTickets.map(t => String(t._id || t.id));
        const upvotes = await Upvote.find({
          user: req.user._id,
          ticket: { $in: ticketIds }
        });
        if (Array.isArray(upvotes)) {
          userUpvotedTicketIds = new Set(upvotes.map(u => String(u.ticket)));
        }
      } catch (err) {
        console.error('Failed to load user upvotes during duplicate check:', err);
      }
    }

    const candidateDocs = openTickets.map(t => {
      const doc = typeof t.toJSON === 'function' ? t.toJSON() : { ...t };
      const id = String(doc._id || doc.id);
      const isAffected = userUpvotedTicketIds.has(id);
      return {
        ...doc,
        id,
        _id: id,
        hasUpvoted: isAffected,
        isAffected,
        affectedCount: doc.upvoteCount || 0
      };
    });

    const aiResult = await checkDuplicateComplaint(
      { title, description, location, category },
      candidateDocs
    );

    let duplicateTicket = null;
    let similarTickets = [];

    if (aiResult.isDuplicate && aiResult.duplicateId) {
      duplicateTicket = candidateDocs.find(t => String(t._id || t.id) === String(aiResult.duplicateId)) || null;
    }

    if (Array.isArray(aiResult.similarIds) && aiResult.similarIds.length > 0) {
      similarTickets = candidateDocs.filter(t => 
        aiResult.similarIds.includes(String(t._id || t.id)) &&
        (!duplicateTicket || String(t._id || t.id) !== String(duplicateTicket._id || duplicateTicket.id))
      );
    }

    const isDuplicate = !!duplicateTicket;

    return res.status(200).json({
      success: true,
      isDuplicate,
      confidence: aiResult.confidence || (isDuplicate ? 0.85 : 0),
      reason: aiResult.reason || '',
      duplicateTicket,
      similarTickets
    });
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return res.status(200).json({
      success: true,
      isDuplicate: false,
      duplicateTicket: null,
      similarTickets: [],
      error: 'Duplicate check failed, proceeding normally'
    });
  }
}

