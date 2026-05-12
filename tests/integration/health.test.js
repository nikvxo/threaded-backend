import {it, expect} from 'vitest';
import request from 'supertest'; 
import app from '../../index.js'; 

it('should return health status', async () => {
    const res = await request(app).get('/api/health').expect(200); 
    expect(res.body).toEqual({ ok: true }); 
}); 