import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';

let mongoUri = 'mongodb://localhost:27017/campusfix-test-auth';

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.COLLEGE_EMAIL_DOMAIN = 'college.edu';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@college.edu',
    password: 'password123',
    confirmPassword: 'password123'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('should fail registration with invalid email domain', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      email: 'test@gmail.com'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(400);
  });

  it('should fail with password mismatch', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      confirmPassword: 'wrongpassword'
    });
    expect(res.statusCode).toBe(400);
  });

  it('should login successfully', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: validUser.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({
      email: validUser.email,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should get current user profile with valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(validUser);
    const token = reg.body.token;
    
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('should fail to get profile with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should fail to get profile with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});
