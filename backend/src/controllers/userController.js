import User from '../models/User.js';

export async function getUsers(req, res, next) {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (req.user.role === 'faculty') {
      filter.role = { $in: ['student', 'volunteer'] };
    } else if (req.user.role === 'admin') {
      if (role) filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-passwordHash');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role === 'faculty') {
      const allowedTransitions = [
        targetUser.role === 'student' && role === 'volunteer',
        targetUser.role === 'volunteer' && role === 'student'
      ];
      
      if (!allowedTransitions.some(Boolean)) {
        return res.status(403).json({ success: false, message: 'Faculty can only promote students to volunteers or demote volunteers to students.' });
      }
    }

    if (req.user.role === 'admin') {
      if (targetUser.role === 'admin' && role !== 'admin') {
        // Can add more complex logic here if there is a superadmin, but for now prevent demoting admins
        return res.status(403).json({ success: false, message: 'Cannot demote another admin.' });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({ success: true, data: targetUser });
  } catch (error) {
    next(error);
  }
}
