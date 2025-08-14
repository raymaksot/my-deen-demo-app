/* eslint-disable */
const request = require('supertest');
const { app } = require('../server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mem;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function sign(user) { return jwt.sign(user, JWT_SECRET); }

jest.setTimeout(120000);

beforeAll(async () => {
  try {
    mem = await MongoMemoryServer.create();
    const uri = mem.getUri();
    await mongoose.connect(uri, { dbName: 'mydeen_test' });
  } catch (error) {
    console.log('MongoDB setup failed, skipping tests');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (mem) await mem.stop();
});

describe('Admin Events API', () => {
  it('should create, update and delete events', async () => {
    if (!mem) {
      console.log('Skipping test due to MongoDB unavailability');
      return;
    }
    
    const admin = sign({ sub: 'admin', role: 'admin' });
    
    // Create event
    const eventData = {
      title: 'Test Event',
      startsAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      location: 'Test Location',
      description: 'Test Description'
    };
    
    const createResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${admin}`)
      .send(eventData);
    
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.title).toBe(eventData.title);
    
    const eventId = createResponse.body._id;
    
    // Update event
    const updateData = {
      title: 'Updated Event',
      startsAt: eventData.startsAt,
      location: 'Updated Location'
    };
    
    const updateResponse = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send(updateData);
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe(updateData.title);
    
    // Delete event
    const deleteResponse = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${admin}`);
    
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});

describe('Admin Reading Groups API', () => {
  it('should create, update and delete reading groups', async () => {
    if (!mem) {
      console.log('Skipping test due to MongoDB unavailability');
      return;
    }
    
    const admin = sign({ sub: 'admin', role: 'admin' });
    
    // Create reading group
    const groupData = {
      name: 'Test Group',
      description: 'Test Description',
      target: { type: 'quran', scope: 'full' }
    };
    
    const createResponse = await request(app)
      .post('/api/reading-groups')
      .set('Authorization', `Bearer ${admin}`)
      .send(groupData);
    
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.name).toBe(groupData.name);
    
    const groupId = createResponse.body._id;
    
    // Update reading group
    const updateData = {
      name: 'Updated Group',
      description: 'Updated Description'
    };
    
    const updateResponse = await request(app)
      .put(`/api/reading-groups/${groupId}`)
      .set('Authorization', `Bearer ${admin}`)
      .send(updateData);
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe(updateData.name);
    
    // Delete reading group
    const deleteResponse = await request(app)
      .delete(`/api/reading-groups/${groupId}`)
      .set('Authorization', `Bearer ${admin}`);
    
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});

describe('Admin endpoints', () => {
  it('should list events and groups for admin', async () => {
    if (!mem) {
      console.log('Skipping test due to MongoDB unavailability');
      return;
    }
    
    const admin = sign({ sub: 'admin', role: 'admin' });
    
    // Test admin events endpoint
    const eventsResponse = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${admin}`);
    
    expect(eventsResponse.status).toBe(200);
    expect(Array.isArray(eventsResponse.body)).toBe(true);
    
    // Test admin reading groups endpoint
    const groupsResponse = await request(app)
      .get('/api/admin/reading-groups')
      .set('Authorization', `Bearer ${admin}`);
    
    expect(groupsResponse.status).toBe(200);
    expect(Array.isArray(groupsResponse.body)).toBe(true);
  });
});