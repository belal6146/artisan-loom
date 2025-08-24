// Dev seed for demo data - only runs in development
import { userAdapter, artworkAdapter, postAdapter, purchaseAdapter, dataService } from "./data-service";
import { useAuthStore } from "@/store/auth";
import { track } from "./track";
import { seedReport } from "./seedReport";

export async function ensureDemoData() {
  if (!import.meta.env.DEV) return;
  
  // Skip if already seeded this version
  if (localStorage.getItem("seed:v2")) {
    // Ensure demo_user is logged in
    const existing = await userAdapter.getAll();
    const demoUser = existing.find(u => u.username === "demo_user");
    if (demoUser) {
      const authUser = {
        id: demoUser.id,
        email: "demo@artisan.app",
        name: demoUser.name,
        username: demoUser.username,
        avatar: demoUser.avatar
      };
      
      useAuthStore.setState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
    
    // Log current seed counts
    await seedReport({
      users: userAdapter,
      artworks: artworkAdapter,
      posts: postAdapter,
      events: { list: () => [] }, // Mock for now
      tools: { list: () => [] }, // Mock for now
      purchases: purchaseAdapter,
    });
    
    try {
      const [u,a,p,e,t,pr] = await Promise.all([
        userAdapter.list(), artworkAdapter.list(), postAdapter.list(),
        eventAdapter.list?.() ?? [], toolsAdapter.list?.() ?? [],
        purchaseAdapter.list?.() ?? []
      ]);
      console.info('[seed:report]', JSON.stringify({
        users:u.length, artworks:a.length, posts:p.length,
        events:e.length, tools:t.length, purchases:pr.length
      }));
    } catch { /* dev-only: best effort */ }
    return;
  }

  const existing = await userAdapter.getAll();
  const haveDemo = existing.some(u => u.username === "demo_user");
  
  if (haveDemo && existing.length >= 10) {
    localStorage.setItem("seed:v2", "true");
    return;
  }

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

  // Create more artworks + posts for each user (enhanced content)
  for (const u of users) {
    // Create 3-4 artworks per user with stable image URLs
    for (let i = 0; i < 4; i++) {
      const categories = ["painting", "sculpture", "digital", "photography"] as const;
      const category = categories[i % categories.length];
      
      await artworkAdapter.create({
        userId: u.id,
        title: `${category === "painting" ? "Landscape" : category === "sculpture" ? "Form Study" : category === "digital" ? "Abstract Vision" : "Portrait"} ${i + 1} by ${u.name}`,
        description: `A beautiful ${category} exploring light, form and artistic expression`,
        imageUrl: `https://picsum.photos/seed/${u.id}-a${i}/800/600`,
        category,
        forSale: Math.random() > 0.3,
        price: { amount: 15000 + Math.floor(Math.random() * 50000), currency: "USD" },
        privacy: Math.random() > 0.1 ? "public" : "private",
        location: "Remote",
        meta: { 
          tags: ["art", category, "original"], 
          colors: ["blue", "green", "red", "yellow", "purple"][Math.floor(Math.random() * 5)], 
          aiGenerated: Math.random() > 0.8 
        }
      });
    }

    // Create 4-5 posts per user
    for (let i = 0; i < 5; i++) {
      const types = ["image", "text", "video"] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      
      await postAdapter.create({
        authorId: u.id,
        type,
        content: [
          "Working on something new 🎨",
          "Love how this turned out!",
          "Experimenting with colors today",
          "Inspired by nature's beauty",
          "Process video of my latest piece",
          "Trying a new technique"
        ][i],
        mediaUrl: type !== "text" ? `https://picsum.photos/seed/${u.id}-p${i}/1200/800` : undefined
      });
    }
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
  
  useAuthStore.setState({
    user: authUser,
    isAuthenticated: true,
    isLoading: false,
    error: null
  });

  localStorage.setItem("seed:v2", "true");
  track("dev_seed_completed", { userCount: users.length });
  
  // Log final seed counts
  await seedReport({
    users: userAdapter,
    artworks: artworkAdapter,
    posts: postAdapter,
    events: { list: () => [] }, // Mock for now
    tools: { list: () => [] }, // Mock for now
    purchases: purchaseAdapter,
  });
  
  // report counts once
  try {
    const [u,a,p,e,t,pr] = await Promise.all([
      userAdapter.list(), artworkAdapter.list(), postAdapter.list(),
      eventAdapter.list?.() ?? [], toolsAdapter.list?.() ?? [],
      purchaseAdapter.list?.() ?? []
    ]);
    console.info('[seed:report]', JSON.stringify({
      users:u.length, artworks:a.length, posts:p.length,
      events:e.length, tools:t.length, purchases:pr.length
    }));
  } catch { /* dev-only */ }
  console.log("✅ Dev seed completed - 10 users with content created");
}