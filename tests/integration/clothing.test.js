import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../../lib/prisma.js';
import app from '../../index.js';

let testUser1Token;
let testUser1Id;
let testUser2Token;
let testUser2Id;
let testClothingId;
let categoryId;

const testEmail1 = `clothing-user-1-${Date.now()}@example.com`;
const testEmail2 = `clothing-user-2-${Date.now()}@example.com`;

beforeAll(async () => {
  // Create test category
  const category = await prisma.category.create({
    data: { name: `test-category-${Date.now()}` },
  });
  categoryId = category.id;

  // Register and login user 1
  const user1Res = await request(app)
    .post('/api/auth/register')
    .send({ email: testEmail1, password: 'password123', name: 'User 1' });
  testUser1Token = user1Res.body.token;
  testUser1Id = user1Res.body.user.id;

  // Register and login user 2
  const user2Res = await request(app)
    .post('/api/auth/register')
    .send({ email: testEmail2, password: 'password123', name: 'User 2' });
  testUser2Token = user2Res.body.token;
  testUser2Id = user2Res.body.user.id;

  // Create a clothing item for user 1
  const createRes = await request(app)
    .post('/api/clothing')
    .set('Authorization', `Bearer ${testUser1Token}`)
    .send({
      name: 'Test Shirt',
      imageUrl: 'https://example.com/shirt.jpg',
      categoryId,
    });
  testClothingId = createRes.body.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail1, testEmail2] } },
  });
  await prisma.category.deleteMany({
    where: { id: categoryId },
  });
  await prisma.$disconnect();
});

describe('Clothing Routes', () => {
  it('should get all clothing items for logged-in user', async () => {
    const res = await request(app)
      .get('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('userId');
  });

  it('should not return items from other users', async () => {
    const user2Res = await request(app)
      .get('/api/clothing')
      .set('Authorization', `Bearer ${testUser2Token}`)
      .expect(200);

    // User 2 should not see User 1's items
    const user2Items = user2Res.body;
    expect(user2Items.find((item) => item.id === testClothingId)).toBeUndefined();
  });

  it('should create a new clothing item with valid category', async () => {
    const res = await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'New Pants',
        imageUrl: 'https://example.com/pants.jpg',
        categoryId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('New Pants');
    expect(res.body.userId).toBe(testUser1Id);
  });

  it('should return 400 when creating clothing with invalid categoryId', async () => {
    const res = await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Bad Item',
        categoryId: 99999,
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  it('should return 400 when creating clothing without name', async () => {
    const res = await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        categoryId,
      })
      .expect(400);

    expect(res.body.error).toBe('Name is required');
  });

  it('should prevent user from deleting another user\'s item', async () => {
    const res = await request(app)
      .delete(`/api/clothing/${testClothingId}`)
      .set('Authorization', `Bearer ${testUser2Token}`)
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  it('should allow user to delete their own item', async () => {
    // Create an item to delete
    const createRes = await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        name: 'Item to Delete',
        categoryId,
      });

    const itemId = createRes.body.id;

    // Delete it
    const deleteRes = await request(app)
      .delete(`/api/clothing/${itemId}`)
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(204);

    // Verify it's deleted
    const getRes = await request(app)
      .get('/api/clothing')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .expect(200);

    expect(getRes.body.find((item) => item.id === itemId)).toBeUndefined();
  });

  it('should return 401 when accessing without token', async () => {
    await request(app)
      .get('/api/clothing')
      .expect(401);
  });
});
