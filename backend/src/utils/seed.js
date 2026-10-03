import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Upvote from '../models/Upvote.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusfix');
    console.log('Connected to DB');

    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Upvote.deleteMany({});

    const salt = await bcrypt.genSalt(12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      passwordHash: await bcrypt.hash('admin123', salt),
      role: 'admin'
    });

    const faculty = await User.create({
      name: 'Faculty User',
      email: 'faculty@college.edu',
      passwordHash: await bcrypt.hash('faculty123', salt),
      role: 'faculty'
    });

    const volunteer = await User.create({
      name: 'Volunteer User',
      email: 'volunteer@college.edu',
      passwordHash: await bcrypt.hash('volunteer123', salt),
      role: 'volunteer'
    });

    const student = await User.create({
      name: 'Student User',
      email: 'student@college.edu',
      passwordHash: await bcrypt.hash('student123', salt),
      role: 'student'
    });

    const tickets = [
      {
        title: 'Wi-Fi Disconnecting in Computer Lab B-204',
        description: 'The Wi-Fi in Computer Lab B-204 keeps disconnecting every 5 minutes. It is impossible to complete online assignments. Please fix ASAP.',
        location: 'Computer Lab B-204',
        createdBy: volunteer._id,
        category: 'Internet',
        priority: 'High',
        department: 'IT Department',
        aiSummary: 'Intermittent Wi-Fi connectivity issues in Computer Lab B-204.',
        aiSuggestedAction: 'Check router configuration and signal strength in B-204.',
        status: 'Submitted'
      },
      {
        title: 'Broken Ceiling Fan in Lecture Room 204',
        description: 'The ceiling fan near the window in Lecture Room 204 is making a loud noise and not spinning properly.',
        location: 'Lecture Room 204',
        createdBy: volunteer._id,
        category: 'Electrical',
        priority: 'Medium',
        department: 'Electrical',
        aiSummary: 'Noisy and malfunctioning ceiling fan in Lecture Room 204.',
        aiSuggestedAction: 'Inspect fan motor and bearings; repair or replace as necessary.',
        status: 'In Review'
      },
      {
        title: 'Water Leakage Near Hostel Block C Entrance',
        description: 'There is a continuous water leak near the entrance of Hostel Block C. A puddle is forming which could be dangerous.',
        location: 'Hostel Block C Entrance',
        createdBy: volunteer._id,
        category: 'Water',
        priority: 'High',
        department: 'Maintenance',
        aiSummary: 'Water leakage causing a puddle at Hostel Block C entrance.',
        aiSuggestedAction: 'Identify source of leak and repair plumbing to prevent slipping hazard.',
        status: 'In Progress'
      },
      {
        title: 'Library Air Conditioning Not Working',
        description: 'The AC in the quiet reading zone on the second floor of the library is blowing warm air.',
        location: 'Library 2nd Floor',
        createdBy: volunteer._id,
        category: 'Library',
        priority: 'Medium',
        department: 'Library',
        aiSummary: 'AC unit in library second floor reading zone is not cooling.',
        aiSuggestedAction: 'Check refrigerant levels and compressor function of the AC unit.',
        status: 'Submitted'
      },
      {
        title: 'Street Light Not Functioning Near Main Gate',
        description: 'The large street light right outside the main gate has been off for two nights. It is very dark and feels unsafe.',
        location: 'Main Gate',
        createdBy: volunteer._id,
        category: 'Infrastructure',
        priority: 'Urgent',
        department: 'Maintenance',
        aiSummary: 'Broken street light near main gate causing safety concerns.',
        aiSuggestedAction: 'Replace bulb or repair electrical connection for the main gate street light.',
        status: 'Submitted'
      }
    ];

    const createdTickets = await Ticket.insertMany(tickets);

    await Upvote.create({ user: student._id, ticket: createdTickets[0]._id });
    await Upvote.create({ user: faculty._id, ticket: createdTickets[0]._id });
    await Ticket.findByIdAndUpdate(createdTickets[0]._id, { upvoteCount: 2 });

    await Upvote.create({ user: admin._id, ticket: createdTickets[4]._id });
    await Ticket.findByIdAndUpdate(createdTickets[4]._id, { upvoteCount: 1 });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
