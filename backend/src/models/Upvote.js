import mongoose from 'mongoose';
import { isFallbackActive, LocalUpvote } from '../localDb.js';

const upvoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  }
}, { timestamps: true });

upvoteSchema.index({ user: 1, ticket: 1 }, { unique: true });

const MongooseUpvote = mongoose.models.Upvote || mongoose.model('Upvote', upvoteSchema);

const Upvote = new Proxy(MongooseUpvote, {
  get(target, prop) {
    if (isFallbackActive() && prop in LocalUpvote) {
      return LocalUpvote[prop];
    }
    return target[prop];
  }
});

export default Upvote;
