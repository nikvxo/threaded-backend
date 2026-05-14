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