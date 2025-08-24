// Dev seed for demo data - only runs in development
import { userAdapter, artworkAdapter, postAdapter, purchaseAdapter, dataService } from "./data-service";
import { useAuthStore } from "@/store/auth";
import { track } from "./track";

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export async function ensureDemoData() {
  if (import.meta.env.PROD) return;

  const existing = await userAdapter.getAll();
  const haveDemo = existing.some(u => u.username === "demo_user");
  if (haveDemo && existing.length >= 10) return;

  console.log("🌱 Seeding 10 users with content...");

  // Create 10 users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      const username = i === 0 ? "demo_user" : `demo_user_${i + 1}`;
      const existing = await userAdapter.getByUsername(username).catch(() => null);
      if (existing) return existing;
      
      return userAdapter.upsert({
        id: `u_${i + 1}`,
        name: `Demo User ${i + 1}`,
        username,
        email: `demo${i + 1}@artisan.app`,
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        bio: "Exploring mediums and styles."
      });
    })
  );

  // Create follows (make it look alive) 
  for (let i = 1; i < users.length; i++) {
    await dataService.followUser(users[0].id, users[i].id).catch(() => {});
    if (i % 2 === 0) await dataService.followUser(users[i].id, users[0].id).catch(() => {});
  }

  // Create artworks + posts for each user
  for (const u of users) {
    const artwork = await artworkAdapter.create({
      userId: u.id,
      title: `Landscape by ${u.name}`,
      description: "Study of light and color",
      imageUrl: `https://picsum.photos/seed/${u.id}-a/800/600`,
      category: "painting",
      forSale: Math.random() > 0.4,
      price: { amount: 25000 + Math.floor(Math.random() * 10000), currency: "USD" },
      privacy: "public",
      location: "Remote",
      meta: { tags: ["landscape", "color"], colors: ["green", "blue"], aiGenerated: false }
    });

    await postAdapter.create({
      authorId: u.id,
      type: "image",
      content: "New piece!",
      mediaUrl: `https://picsum.photos/seed/${u.id}-p/1200/800`
    });
  }

  // Create purchases for insights (buyer: demo_user)
  const buyer = users[0];
  const others = users.slice(1);
  for (let i = 0; i < 6; i++) {
    const artist = others[i % others.length];
    const artworks = await artworkAdapter.listByUser(artist.id);
    const aw = artworks[0];
    if (!aw) continue;
    
    await purchaseAdapter.create({
      artworkId: aw.id,
      price: aw.price ?? { amount: 40000, currency: "USD" }
    });
  }

  // Auto-login demo_user in dev
  const authUser = {
    id: buyer.id,
    email: "demo@artisan.app",
    name: buyer.name,
    username: buyer.username,
    avatar: buyer.avatar
  };
  
  useAuthStore.getState().login(authUser).catch(() => {
    // Manual set for demo
    useAuthStore.setState({
      user: authUser,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  });

  track("dev_seed_completed", { userCount: users.length });
  console.log("✅ Dev seed completed - 10 users with content created");
}