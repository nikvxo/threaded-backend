import {it, expect} from 'vitest';
import request from 'supertest'; 
import app from '../../index.js'; 

it('should return health status', async () => {
    const res = await request(app).get('/api/health').expect(200); 
    expect(res.body).toEqual({ ok: true }); 
    expect(res.headers['x-content-type-options']).toBe('nosniff');
}); 

it('should return a JSON error for an unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist').expect(404);
    expect(res.body).toEqual({ error: 'Route not found' });
});