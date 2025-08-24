// User lookup utilities for flexible profile resolution
import { userAdapter } from '@/lib/data-service';
import type { User } from '@/types';

export async function getUserByHandle(handle: string): Promise<User | null> {
  if (!handle) return null;
  
  try {
    // Try by ID first (for handles like "u_demo")
    if (handle.startsWith('u_')) {
      const byId = await userAdapter.getById(handle);
      if (byId) return byId;
    }
    
    // Try by username
    const allUsers = await userAdapter.getAll();
    const byUsername = allUsers.find(u => u.username === handle);
    if (byUsername) return byUsername;
    
    return null;
  } catch (error) {
    console.error('Failed to get user by handle:', error);
    return null;
  }
}

export async function ensureDemoUser(): Promise<User | null> {
  if (import.meta.env.PROD) return null;
  
  try {
    // Check if demo user exists
    const existing = await getUserByHandle('demo_user');
    if (existing) return existing;
    
    // Create demo user if missing
    const demoUser: User = {
      id: 'u_demo',
      name: 'Demo Artist',
      username: 'demo_user',
      avatar: 'https://i.pravatar.cc/120?img=5',
      bio: 'Exploring watercolor & woodblock prints. Love experimenting with AI-generated art.',
      birthday: '1995-06-01T00:00:00Z',
      location: 'San Francisco, CA',
      website: 'https://demo-artist.example',
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };
    
    // Add to localStorage for development
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(demoUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return demoUser;
  } catch (error) {
    console.error('Failed to ensure demo user:', error);
    return null;
  }
}