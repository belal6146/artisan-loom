import { User, Artwork, Post, Comment, Collaboration, Event, Purchase } from "@/types";

export const mockUser: User = {
  id: "user-1",
  name: "Test User",
  username: "testuser",
  avatar: "https://example.com/avatar.jpg",
  bio: "Test bio",
  birthday: "1990-01-01",
  followers: [],
  following: [],
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockArtwork: Artwork = {
  id: "artwork-1",
  userId: "user-1",
  title: "Test Artwork",
  description: "Test description",
  imageUrl: "https://example.com/artwork.jpg",
  category: "painting",
  forSale: false,
  privacy: "public",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockArtworkForSale: Artwork = {
  ...mockArtwork,
  id: "artwork-2",
  forSale: true,
  price: { amount: 100, currency: "USD" },
};

export const mockPost: Post = {
  id: "post-1",
  authorId: "user-1",
  type: "text",
  content: "Test post content",
  createdAt: "2024-01-01T00:00:00Z",
  likes: 0,
  commentIds: [],
  likedBy: [],
};

export const mockComment: Comment = {
  id: "comment-1", 
  postId: "post-1",
  authorId: "user-1",
  text: "Test comment",
  createdAt: "2024-01-01T00:00:00Z",
  likes: 0,
  likedBy: [],
};

export const mockCollaboration: Collaboration = {
  id: "collab-1",
  name: "Test Collaboration",
  description: "Test collaboration description",
  deadline: "2024-12-31T00:00:00Z",
  skills: ["painting", "design"],
  compensationType: "voluntary",
  creatorId: "user-1",
  participants: 1,
  maxParticipants: 5,
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockEvent: Event = {
  id: "event-1",
  title: "Test Event",
  type: "gallery",
  startsAt: "2024-06-01T10:00:00Z",
  endsAt: "2024-06-01T18:00:00Z",
  location: "Test Gallery",
  description: "Test event description",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockPurchase: Purchase = {
  id: "purchase-1",
  buyerId: "user-1",
  artworkId: "artwork-2",
  price: { amount: 100, currency: "USD" },
  purchasedAt: "2024-01-01T00:00:00Z",
};