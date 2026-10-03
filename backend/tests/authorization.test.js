import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Ticket from '../src/models/Ticket.js';
import jwt from 'jsonwebtoken';

let mongoUri = 'mongodb://localhost:27017/campusfix-test-authz';
let studentToken, volunteerToken, facultyToken, adminToken;
let student, volunteer, faculty, admin;
let ticketId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  await mongoose.connect(mongoUri);

  student = await User.create({ name: 'Student', email: 's@c.edu', passwordHash: 'hash', role: 'student' });
  volunteer = await User.create({ name: 'Vol', email: 'v@c.edu', passwordHash: 'hash', role: 'volunteer' });
  faculty = await User.create({ name: 'Fac', email: 'f@c.edu', passwordHash: 'hash', role: 'faculty' });
  admin = await User.create({ name: 'Admin', email: 'a@c.edu', passwordHash: 'hash', role: 'admin' });

  studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
  volunteerToken = jwt.sign({ id: volunteer._id }, process.env.JWT_SECRET);
  facultyToken = jwt.sign({ id: faculty._id }, process.env.JWT_SECRET);
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Authorization Tests', () => {
  const newTicket = { title: 'Test Ticket 1234', description: 'Test Description that is long enough' };

  it('Student cannot create a ticket', async () => {
    const res = await request(app).post('/api/tickets').set('Authorization', `Bearer ${studentToken}`).send(newTicket);
    expect(res.statusCode).toBe(403);
  });

  it('Volunteer can create a ticket', async () => {
    const res = await request(app).post('/api/tickets').set('Authorization', `Bearer ${volunteerToken}`).send(newTicket);
    expect(res.statusCode).toBe(201);
    ticketId = res.body.data._id;
  });

  it('Volunteer cannot update a ticket', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${volunteerToken}`).send({ status: 'Resolved' });
    expect(res.statusCode).toBe(403);
  });

  it('Faculty cannot update a ticket', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${facultyToken}`).send({ status: 'Resolved' });
    expect(res.statusCode).toBe(403);
  });

  it('Admin can update a ticket', async () => {
    const res = await request(app).patch(`/api/tickets/${ticketId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'Resolved' });
    expect(res.statusCode).toBe(200);
  });

  it('Faculty can get users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${facultyToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('Student cannot get users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('Faculty can promote student to volunteer', async () => {
    const res = await request(app).patch(`/api/users/${student._id}/role`).set('Authorization', `Bearer ${facultyToken}`).send({ role: 'volunteer' });
    expect(res.statusCode).toBe(200);
  });

  it('Faculty cannot promote to admin', async () => {
    const res = await request(app).patch(`/api/users/${student._id}/role`).set('Authorization', `Bearer ${facultyToken}`).send({ role: 'admin' });
    expect(res.statusCode).toBe(403);
  });

  it('Unauthenticated requests return 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
