import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { prisma } from '../../lib/prisma.js';

const testEmail = `clothing-outfits-${Date.now()}@example.com`;
let authToken;
let userId;
let categoryId;
let clothingItemId;
let outfitId;

beforeAll(async () => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: testEmail,
      password: 'password123',
      name: 'Clothing and Outfits Test User',
    })
    .expect(201);

  authToken = registerResponse.body.token;
  userId = registerResponse.body.user.id;

  const category = await prisma.category.create({
    data: { name: `Test Category ${Date.now()}` },
  });
  categoryId = category.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.category.deleteMany({ where: { id: categoryId } });
  await prisma.$disconnect();
});

describe('protected clothing and outfit endpoints', () => {
  it('rejects requests without authentication', async () => {
    await request(app).get('/api/clothing').expect(401);
    await request(app).get('/api/outfits').expect(401);
  });

  it('creates, lists, updates, and deletes a clothing item', async () => {
    const createResponse = await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Blue Jacket', imageUrl: 'https://example.com/jacket.jpg', categoryId })
      .expect(201);

    clothingItemId = createResponse.body.id;
    expect(createResponse.body).toMatchObject({ name: 'Blue Jacket', categoryId });
    expect(createResponse.body.category.id).toBe(categoryId);

    const listResponse = await request(app)
      .get('/api/clothing')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: clothingItemId, name: 'Blue Jacket' })])
    );

    await request(app)
      .put(`/api/clothing/${clothingItemId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Jacket', categoryId })
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('Updated Jacket');
      });

    await request(app)
      .delete(`/api/clothing/${clothingItemId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('creates, lists, updates, and deletes an outfit with tagged items', async () => {
    const createResponse = await request(app)
      .post('/api/outfits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Weekend Outfit', itemNames: ['White T-Shirt', 'Black Jeans'] })
      .expect(201);

    outfitId = createResponse.body.id;
    expect(createResponse.body.title).toBe('Weekend Outfit');
    expect(createResponse.body.items).toHaveLength(2);

    const listResponse = await request(app)
      .get('/api/outfits')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: outfitId, title: 'Weekend Outfit' })])
    );

    await request(app)
      .put(`/api/outfits/${outfitId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Weekend Outfit', itemNames: ['White T-Shirt'] })
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Updated Weekend Outfit');
        expect(body.items).toHaveLength(1);
      });

    await request(app)
      .delete(`/api/outfits/${outfitId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('returns validation errors for invalid create requests', async () => {
    await request(app)
      .post('/api/clothing')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '', categoryId })
      .expect(400)
      .expect({ error: 'Name is required' });

    await request(app)
      .post('/api/outfits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '' })
      .expect(400)
      .expect({ error: 'Title is required' });
  });
});