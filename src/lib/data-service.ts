// Data service adapters - Mock implementations for development
import { log } from "./log";
import { storage } from "./storage";
import type { 
  User, Artwork, Post, Comment, Collaboration, Event, Purchase, Resource, ID
} from "@/types";
import type { 
  CreateUser, UpdateUser, CreateArtwork, UpdateArtwork,
  CreatePost, CreateComment, CreateCollaboration,
  CreateResource, CreateEvent, CreatePurchase
} from "@/schemas";

// Storage keys
const STORAGE_KEYS = {
  USERS: "artisan_users",
  ARTWORKS: "artisan_artworks", 
  POSTS: "artisan_posts",
  COMMENTS: "artisan_comments",
  COLLABORATIONS: "artisan_collaborations",
  RESOURCES: "artisan_resources",
  EVENTS: "artisan_events",
  PURCHASES: "artisan_purchases",
} as const;

// Helper to generate IDs
const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get current ISO string
const now = (): string => new Date().toISOString();

// Base adapter interface
interface DataAdapter<T, CreateT, UpdateT = Partial<T>> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateT): Promise<T>;
  update(id: string, data: UpdateT): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Generic localStorage adapter
class LocalStorageAdapter<T extends { id: string }, CreateT, UpdateT = Partial<T>> 
  implements DataAdapter<T, CreateT, UpdateT> {
  
  constructor(private storageKey: string) {}

  private getData(): T[] {
    return storage.get<T[]>(this.storageKey) || [];
  }

  private setData(data: T[]): void {
    storage.set(this.storageKey, data);
  }

  async getAll(): Promise<T[]> {
    return this.getData();
  }

  async getById(id: string): Promise<T | null> {
    const items = this.getData();
    return items.find(item => item.id === id) || null;
  }

  async create(data: CreateT): Promise<T> {
    const items = this.getData();
    const newItem = {
      ...data,
      id: generateId(),
      createdAt: now(),
    } as unknown as T;
    
    items.push(newItem);
    this.setData(items);
    
    log.info(`Created ${this.storageKey} item`, { id: newItem.id });
    return newItem;
  }

  async update(id: string, data: UpdateT): Promise<T | null> {
    const items = this.getData();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...data } as T;
    items[index] = updatedItem;
    this.setData(items);
    
    log.info(`Updated ${this.storageKey} item`, { id });
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getData();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    this.setData(items);
    
    log.info(`Deleted ${this.storageKey} item`, { id });
    return true;
  }
}

// Specialized adapters
export const userAdapter = new LocalStorageAdapter<User, CreateUser, UpdateUser>(STORAGE_KEYS.USERS);
export const artworkAdapter = new LocalStorageAdapter<Artwork, CreateArtwork, UpdateArtwork>(STORAGE_KEYS.ARTWORKS);
export const postAdapter = new LocalStorageAdapter<Post, CreatePost>(STORAGE_KEYS.POSTS);
export const commentAdapter = new LocalStorageAdapter<Comment, CreateComment>(STORAGE_KEYS.COMMENTS);
export const collaborationAdapter = new LocalStorageAdapter<Collaboration, CreateCollaboration>(STORAGE_KEYS.COLLABORATIONS);
export const resourceAdapter = new LocalStorageAdapter<Resource, CreateResource, Partial<Resource>>(STORAGE_KEYS.RESOURCES);
export const eventAdapter = new LocalStorageAdapter<Event, CreateEvent>(STORAGE_KEYS.EVENTS);
export const purchaseAdapter = new LocalStorageAdapter<Purchase, CreatePurchase>(STORAGE_KEYS.PURCHASES);

// Additional methods for complex operations
export const dataService = {
  // User operations
  async followUser(followerId: ID, followeeId: ID): Promise<void> {
    const [follower, followee] = await Promise.all([
      userAdapter.getById(followerId),
      userAdapter.getById(followeeId)
    ]);

    if (!follower || !followee) throw new Error("User not found");

    if (!follower.following.includes(followeeId)) {
      await userAdapter.update(followerId, {
        following: [...follower.following, followeeId]
      });
    }

    if (!followee.followers.includes(followerId)) {
      await userAdapter.update(followeeId, {
        followers: [...followee.followers, followerId]
      });
    }

    log.info("User followed", { followerId, followeeId });
  },

  async unfollowUser(followerId: ID, followeeId: ID): Promise<void> {
    const [follower, followee] = await Promise.all([
      userAdapter.getById(followerId),
      userAdapter.getById(followeeId)
    ]);

    if (!follower || !followee) throw new Error("User not found");

    await userAdapter.update(followerId, {
      following: follower.following.filter(id => id !== followeeId)
    });

    await userAdapter.update(followeeId, {
      followers: followee.followers.filter(id => id !== followerId)
    });

    log.info("User unfollowed", { followerId, followeeId });
  },

  // Like operations
  async toggleLike(userId: ID, itemId: ID, itemType: "post" | "comment" | "resource"): Promise<boolean> {
    const adapter = itemType === "post" ? postAdapter : 
                   itemType === "comment" ? commentAdapter : resourceAdapter;
    
    const item = await adapter.getById(itemId);
    if (!item) throw new Error(`${itemType} not found`);

    const likedBy = (item as any).likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    const newLikedBy = isLiked 
      ? likedBy.filter((id: ID) => id !== userId)
      : [...likedBy, userId];

    await adapter.update(itemId, {
      likes: newLikedBy.length,
      likedBy: newLikedBy,
    } as any);

    log.info(`${isLiked ? "Unliked" : "Liked"} ${itemType}`, { userId, itemId });
    return !isLiked;
  },

  // Get user's artworks
  async getUserArtworks(userId: ID, includePrivate = false): Promise<Artwork[]> {
    const artworks = await artworkAdapter.getAll();
    return artworks
      .filter(artwork => artwork.userId === userId)
      .filter(artwork => includePrivate || artwork.privacy === "public");
  },

  // Get artworks for sale
  async getArtworksForSale(): Promise<Artwork[]> {
    const artworks = await artworkAdapter.getAll();
    return artworks
      .filter(artwork => artwork.privacy === "public" && artwork.forSale);
  },

  // Get user's posts
  async getUserPosts(userId: ID): Promise<Post[]> {
    const posts = await postAdapter.getAll();
    return posts
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get feed posts
  async getFeedPosts(userId: ID): Promise<Post[]> {
    const [user, posts] = await Promise.all([
      userAdapter.getById(userId),
      postAdapter.getAll()
    ]);

    if (!user) return [];

    const followingIds = new Set([...user.following, userId]);
    return posts
      .filter(post => followingIds.has(post.authorId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get comments for item
  async getComments(itemId: ID, itemType: "post" | "artwork" | "collaboration" | "resource"): Promise<Comment[]> {
    const comments = await commentAdapter.getAll();
    const field = `${itemType}Id` as keyof Comment;
    
    return comments
      .filter(comment => comment[field] === itemId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  // Get user's purchases
  async getUserPurchases(userId: ID): Promise<Purchase[]> {
    const purchases = await purchaseAdapter.getAll();
    return purchases
      .filter(purchase => purchase.buyerId === userId)
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
  },

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    const events = await eventAdapter.getAll();
    const now = new Date();
    const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.startsAt);
        return eventDate >= now && eventDate <= sixMonthsFromNow;
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  },
};