import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, facultyCode, adminCode } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const domain = (process.env.COLLEGE_EMAIL_DOMAIN || '').trim().toLowerCase();
    if (domain && !email.toLowerCase().endsWith(`@${domain}`)) {
      return res.status(400).json({ success: false, message: `Email must belong to @${domain}.` });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    let assignedRole = 'student';
    if (adminCode) {
      if (adminCode.trim() === (process.env.ADMIN_INVITE_CODE || '').trim()) {
        assignedRole = 'admin';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Admin invite code.' });
      }
    } else if (facultyCode) {
      if (facultyCode.trim() === (process.env.FACULTY_INVITE_CODE || '').trim()) {
        assignedRole = 'faculty';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Faculty invite code.' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user.toJSON()
  });
}
