import {it, expect} from 'vitest'; 
import { sanitizeUser } from '../../lib/sanitize.js';


it('removes sensitive and extra fields, preserving public fields', () => {
    const user = {
        id: 123,
        email: 'test@example.com',
        name: 'Test',
        createdAt: '2026-05-18T00:00:00Z',
        passwordHash: 'secret',
        extra: 'shouldBeRemoved',
    };

    const out = sanitizeUser({...user});

    expect(out).toEqual({
        id: 123,
        email: 'test@example.com',
        name: 'Test',
        createdAt: '2026-05-18T00:00:00Z', 
    });
    expect(out.passwordHash).toBeUndefined(); 
    expect(out.extra).toBeUndefined(); 
}); 

it('does not mutate the input object', () => {
    const user = {
        id: 1,
        email: 'a@b.com',
        name: 'A',
        createdAt: '2026-05-18',
        passwordHash: 'x', 
    }; 

    const copy = {...user}; 
    sanitizeUser(copy); 
    expect(copy.passwordHash).toBe('x'); 
}); 

it('throws an invalid input', () => {
    expect(() => sanitizeUser(null)).toThrow('sanitizeUser: invalid user'); 
    expect(() => sanitizeUser(undefined)).toThrow('sanitizeUser: invalid user'); 
});
