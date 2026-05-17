import {afterAll, expect, it} from 'vitest'; 
import request from 'supertest'; 
import { prisma } from '../../lib/prisma.js';
import app from '../../index.js'; 

const testEmail = 'auth-test@example.com'; 

afterAll(async () => {
    // delete test user from db after tests complete
    await prisma.user.deleteMany({
        where: { email: testEmail },
    });
    await prisma.$disconnect(); 
}); 

it('should register a new user and return token', async () => {
    const response = await request(app)
    .post('/api/auth/register')
     .send({
        email: testEmail, 
        password: 'password123',
        name: 'Test User', 
    })
     .expect(201);

    expect(response.body.user).toMatchObject({
        email: testEmail,
        name: 'Test User',
     });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.token).toBeTypeOf('string');
});

it('should login an existing user and return a token', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'password123'})
        .expect(200);
    
    expect(response.body.user).toMatchObject({ email: testEmail });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.token).toBeTypeOf('string');

    const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(200); 
    expect(me.body.user.email).toBe(testEmail); 
});