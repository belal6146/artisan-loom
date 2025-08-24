// Seed report for debugging and monitoring
interface Adapter {
  list(): Promise<unknown[]>;
}

export async function seedReport(adapters: {
  users: Adapter;
  artworks: Adapter;
  posts: Adapter;
  events: Adapter;
  tools: Adapter;
  purchases: Adapter;
}) {
  const [u, a, p, e, t, pr] = await Promise.all([
    adapters.users.list(),
    adapters.artworks.list(),
    adapters.posts.list(),
    adapters.events.list?.() ?? [],
    adapters.tools.list?.() ?? [],
    adapters.purchases.list?.() ?? [],
  ]);
  
  const report = {
    users: u.length,
    artworks: a.length,
    posts: p.length,
    events: e.length,
    tools: t.length,
    purchases: pr.length,
  };
  
  console.info('[seed:report]', report);
  return report;
}
