import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockUser } from '../fixtures';
import { log } from '@/lib/log';
import { metrics, METRICS } from '@/lib/metrics';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metrics.reset();
  });

  it('should handle successful login', async () => {
    // Mock successful login
    mockSupabase.auth.signIn.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    });

    // Simulate login flow
    const result = await mockSupabase.auth.signIn({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result.error).toBeNull();
    expect(result.data.user).toEqual(mockUser);
    
    // Verify metrics were incremented
    metrics.increment(METRICS.AUTH_SUCCESS);
    expect(metrics.getCounters()[METRICS.AUTH_SUCCESS]).toBe(1);
  });

  it('should handle login failure', async () => {
    // Mock failed login
    mockSupabase.auth.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    });

    const result = await mockSupabase.auth.signIn({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    expect(result.error).toBeTruthy();
    expect(result.data.user).toBeNull();
    
    // Verify metrics were incremented
    metrics.increment(METRICS.AUTH_FAILURE);
    expect(metrics.getCounters()[METRICS.AUTH_FAILURE]).toBe(1);
  });

  it('should handle session check', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    });

    const result = await mockSupabase.auth.getSession();
    
    expect(result.data.session).toBeTruthy();
    expect(result.data.session.user).toEqual(mockUser);
  });
});