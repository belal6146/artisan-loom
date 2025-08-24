// Dev seed for demo data - only runs in development
import { storage } from "./storage";

export function devSeed() {
  if (import.meta.env.PROD) return;
  if (storage.get("devSeeded") === "yes") return;

  const userId = "u_demo";
  const now = new Date().toISOString();

  const demoUser = {
    id: userId,
    name: "Demo Artist", 
    username: "demo_user",
    avatar: "https://i.pravatar.cc/120?img=5",
    bio: "Loves watercolor & woodblock prints. Exploring digital art.",
    birthday: "1995-06-01T00:00:00Z",
    location: "San Francisco, CA",
    website: "https://demo-artist.example",
    followers: [],
    following: [],
    createdAt: now
  };

  const artworks = [
    {
      id: "a1",
      userId,
      title: "Evening Wash",
      description: "Watercolor study of evening light on water",
      imageUrl: "/placeholder.svg",
      category: "painting",
      forSale: true,
      price: { amount: 180.00, currency: "USD" },
      privacy: "public",
      createdAt: now,
      meta: { tags: ["watercolor", "landscape"], aiGenerated: false }
    },
    {
      id: "a2", 
      userId,
      title: "Cherry Blossoms",
      description: "Traditional woodblock print inspired by ukiyo-e",
      imageUrl: "/placeholder.svg",
      category: "handicraft",
      forSale: false,
      privacy: "public", 
      createdAt: now,
      meta: { tags: ["woodblock", "japanese"], aiGenerated: false }
    }
  ];

  const posts = [
    {
      id: "p1",
      authorId: userId,
      type: "image",
      content: "Just finished this spring study. Love how the cherry blossoms turned out!",
      mediaUrl: "/placeholder.svg",
      createdAt: now,
      likes: 12,
      commentIds: [],
      likedBy: []
    }
  ];

  const purchases = [
    {
      id: "pur1",
      buyerId: userId,
      artworkId: "a1", 
      price: { amount: 180.00, currency: "USD" },
      purchasedAt: now
    }
  ];

  // Store in localStorage for development
  storage.set("users", JSON.stringify([demoUser]));
  storage.set("artworks", JSON.stringify(artworks));
  storage.set("posts", JSON.stringify(posts));
  storage.set("purchases", JSON.stringify(purchases));
  storage.set("devSeeded", "yes");

  console.log("✅ Dev seed completed - demo user and content created");
}