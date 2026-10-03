import Ticket from '../models/Ticket.js';
import Upvote from '../models/Upvote.js';

export async function toggleUpvote(req, res, next) {
  try {
    const ticketId = req.params.id;
    const userId = req.user._id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const existingUpvote = await Upvote.findOne({ user: userId, ticket: ticketId });

    if (existingUpvote) {
      await Upvote.findByIdAndDelete(existingUpvote._id);
      const updated = await Ticket.findByIdAndUpdate(
        ticketId,
        { $inc: { upvoteCount: -1 } },
        { new: true }
      );
      const finalCount = Math.max(0, updated?.upvoteCount ?? Math.max(0, ticket.upvoteCount - 1));
      
      return res.status(200).json({
        success: true,
        upvoted: false,
        isAffected: false,
        upvoteCount: finalCount,
        affectedCount: finalCount
      });
    } else {
      await Upvote.create({ user: userId, ticket: ticketId });
      const updated = await Ticket.findByIdAndUpdate(
        ticketId,
        { $inc: { upvoteCount: 1 } },
        { new: true }
      );
      const finalCount = updated?.upvoteCount ?? (ticket.upvoteCount + 1);
      
      return res.status(200).json({
        success: true,
        upvoted: true,
        isAffected: true,
        upvoteCount: finalCount,
        affectedCount: finalCount
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      // Handle race condition where upvote was already created
      return res.status(200).json({
        success: true,
        message: 'Already marked as affected',
        upvoted: true,
        isAffected: true
      });
    }
    next(error);
  }
}
