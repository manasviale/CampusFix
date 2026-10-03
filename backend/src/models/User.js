import mongoose from 'mongoose';
import { isFallbackActive, LocalUser } from '../localDb.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'volunteer', 'faculty', 'admin'],
    default: 'student'
  }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (isFallbackActive() && prop in LocalUser) {
      return LocalUser[prop];
    }
    return target[prop];
  }
});

export default User;
