/* eslint-disable */
const request = require('supertest');
const { app } = require('../server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Comment } = require('../models/Comment');
const { User } = require('../models/User');
require('dotenv').config();

let mem;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function sign(user) { return jwt.sign(user, JWT_SECRET); }

jest.setTimeout(120000);

beforeAll(async () => {
  mem = await MongoMemoryServer.create();
  const uri = mem.getUri();
  await mongoose.connect(uri, { dbName: 'mydeen_test' });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mem) await mem.stop();
});

describe('Admin Comments Management', () => {
  beforeEach(async () => {
    // Clean up before each test
    await Comment.deleteMany({});
    await User.deleteMany({});
  });

  it('should list pending comments for admin', async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password'
    });

    // Create a pending comment
    await Comment.create({
      userId: user._id.toString(),
      parentType: 'article',
      parentId: 'a1',
      text: 'This is a pending comment',
      status: 'pending'
    });

    // Create an approved comment (should not appear in pending list)
    await Comment.create({
      userId: user._id.toString(),
      parentType: 'article',
      parentId: 'a2',
      text: 'This is an approved comment',
      status: 'approved'
    });

    const adminToken = sign({ sub: 'admin1', role: 'admin' });
    
    const response = await request(app)
      .get('/api/admin/comments?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].text).toBe('This is a pending comment');
    expect(response.body.data[0].status).toBe('pending');
    expect(response.body.data[0].userId.name).toBe('Test User');
    expect(response.body.data[0].userId.email).toBe('test@example.com');
    expect(response.body.total).toBe(1);
  });

  it('should approve a pending comment', async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password'
    });

    // Create a pending comment
    const comment = await Comment.create({
      userId: user._id.toString(),
      parentType: 'article',
      parentId: 'a1',
      text: 'This comment needs approval',
      status: 'pending'
    });

    const adminToken = sign({ sub: 'admin1', role: 'admin' });
    
    const response = await request(app)
      .post(`/api/admin/comments/${comment._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('approved');

    // Verify the comment was actually updated in the database
    const updatedComment = await Comment.findById(comment._id);
    expect(updatedComment.status).toBe('approved');
  });

  it('should reject/delete a pending comment', async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password'
    });

    // Create a pending comment
    const comment = await Comment.create({
      userId: user._id.toString(),
      parentType: 'article',
      parentId: 'a1',
      text: 'This comment will be rejected',
      status: 'pending'
    });

    const adminToken = sign({ sub: 'admin1', role: 'admin' });
    
    const response = await request(app)
      .delete(`/api/admin/comments/${comment._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify the comment was actually deleted from the database
    const deletedComment = await Comment.findById(comment._id);
    expect(deletedComment).toBeNull();
  });

  it('should require admin role to access admin endpoints', async () => {
    const userToken = sign({ sub: 'user1', role: 'user' });
    
    // Test list endpoint
    const listResponse = await request(app)
      .get('/api/admin/comments')
      .set('Authorization', `Bearer ${userToken}`);
    expect(listResponse.status).toBe(403);

    // Test approve endpoint
    const approveResponse = await request(app)
      .post('/api/admin/comments/123/approve')
      .set('Authorization', `Bearer ${userToken}`);
    expect(approveResponse.status).toBe(403);

    // Test delete endpoint
    const deleteResponse = await request(app)
      .delete('/api/admin/comments/123')
      .set('Authorization', `Bearer ${userToken}`);
    expect(deleteResponse.status).toBe(403);
  });
});