// Data normalizers to prevent type widening
import type { 
  User, 
  Artwork, 
  Post, 
  Comment, 
  Collaboration, 
  Event, 
  Purchase 
} from "@/types";

// Utility to create normalized collections
export interface NormalizedCollection<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export const createNormalizedCollection = <T extends { id: string }>(
  items: T[]
): NormalizedCollection<T> => {
  const byId: Record<string, T> = {};
  const allIds: string[] = [];

  items.forEach((item) => {
    byId[item.id] = item;
    allIds.push(item.id);
  });

  return { byId, allIds };
};

// Specific normalizers for each entity type
export const normalizeUsers = (users: User[]): NormalizedCollection<User> =>
  createNormalizedCollection(users);

export const normalizeArtworks = (artworks: Artwork[]): NormalizedCollection<Artwork> =>
  createNormalizedCollection(artworks);

export const normalizePosts = (posts: Post[]): NormalizedCollection<Post> =>
  createNormalizedCollection(posts);

export const normalizeComments = (comments: Comment[]): NormalizedCollection<Comment> =>
  createNormalizedCollection(comments);

export const normalizeCollaborations = (collaborations: Collaboration[]): NormalizedCollection<Collaboration> =>
  createNormalizedCollection(collaborations);

export const normalizeEvents = (events: Event[]): NormalizedCollection<Event> =>
  createNormalizedCollection(events);

export const normalizePurchases = (purchases: Purchase[]): NormalizedCollection<Purchase> =>
  createNormalizedCollection(purchases);

// Helper to get items from normalized collection
export const getItemsFromNormalized = <T>(
  collection: NormalizedCollection<T>
): T[] => {
  return collection.allIds.map((id) => collection.byId[id]);
};

// Helper to get item by id from normalized collection
export const getItemById = <T>(
  collection: NormalizedCollection<T>,
  id: string
): T | undefined => {
  return collection.byId[id];
};

// Helper to add item to normalized collection
export const addToNormalizedCollection = <T extends { id: string }>(
  collection: NormalizedCollection<T>,
  item: T
): NormalizedCollection<T> => {
  if (collection.byId[item.id]) {
    // Item already exists, replace it
    return {
      byId: { ...collection.byId, [item.id]: item },
      allIds: collection.allIds,
    };
  }

  // New item, add it
  return {
    byId: { ...collection.byId, [item.id]: item },
    allIds: [...collection.allIds, item.id],
  };
};

// Helper to remove item from normalized collection
export const removeFromNormalizedCollection = <T>(
  collection: NormalizedCollection<T>,
  id: string
): NormalizedCollection<T> => {
  const { [id]: removed, ...byId } = collection.byId;
  const allIds = collection.allIds.filter((itemId) => itemId !== id);

  return { byId, allIds };
};

// Helper to update item in normalized collection
export const updateInNormalizedCollection = <T extends { id: string }>(
  collection: NormalizedCollection<T>,
  id: string,
  updates: Partial<T>
): NormalizedCollection<T> => {
  const existingItem = collection.byId[id];
  if (!existingItem) {
    return collection;
  }

  const updatedItem = { ...existingItem, ...updates };
  return {
    byId: { ...collection.byId, [id]: updatedItem },
    allIds: collection.allIds,
  };
};