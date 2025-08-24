import { ProfileSummary, ProfileInsights, Period, ProfileSummarySchema, ProfileInsightsSchema } from "@/schemas";

// Mock data service for insights
class InsightsClient {
  async getSummary(userId: string): Promise<ProfileSummary> {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockSummary: ProfileSummary = {
      id: userId,
      name: "Artist Name",
      username: "artist",
      avatar: undefined,
      bio: "Digital artist creating stunning visuals",
      location: "San Francisco, CA",
      website: "https://artist.com",
      followers: 1250,
      following: 500,
      posts: 85,
      artworks: 42,
      sales: 15, // Only shown if owner
    };
    
    return ProfileSummarySchema.parse(mockSummary);
  }

  async getInsights({ userId, period }: { userId: string; period: Period }): Promise<ProfileInsights> {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    const mockInsights: ProfileInsights = {
      userId,
      period,
      creator: {
        posts: this.getCreatorStatsByPeriod(period, 'posts'),
        likes: this.getCreatorStatsByPeriod(period, 'likes'),
        comments: this.getCreatorStatsByPeriod(period, 'comments'),
        followersDelta: this.getCreatorStatsByPeriod(period, 'followers'),
        topPosts: ['post-1', 'post-2', 'post-3'],
      },
      buyer: {
        purchases: this.getBuyerStatsByPeriod(period, 'purchases'),
        totalSpent: { amount: 45000, currency: 'USD' },
        avgPrice: { amount: 3000, currency: 'USD' },
        topCategories: [
          { category: 'painting', count: 8 },
          { category: 'digital', count: 5 },
          { category: 'photography', count: 2 },
        ],
        topArtists: [
          { userId: 'artist-1', name: 'Jane Doe', count: 4 },
          { userId: 'artist-2', name: 'John Smith', count: 3 },
          { userId: 'artist-3', name: 'Alice Johnson', count: 2 },
        ],
        timeline: [
          { purchasedAt: '2024-01-15T10:00:00Z', artworkId: 'art-1', price: { amount: 5000, currency: 'USD' } },
          { purchasedAt: '2024-01-10T14:30:00Z', artworkId: 'art-2', price: { amount: 3500, currency: 'USD' } },
          { purchasedAt: '2024-01-05T09:15:00Z', artworkId: 'art-3', price: { amount: 7500, currency: 'USD' } },
        ],
      },
    };
    
    return ProfileInsightsSchema.parse(mockInsights);
  }

  private getCreatorStatsByPeriod(period: Period, metric: string): number {
    const multipliers = { '7d': 0.2, '30d': 1, '90d': 3, '365d': 12, 'all': 20 };
    const baseValues = { posts: 5, likes: 150, comments: 45, followers: 25 };
    const base = baseValues[metric as keyof typeof baseValues] || 10;
    return Math.floor(base * (multipliers[period] || 1));
  }

  private getBuyerStatsByPeriod(period: Period, metric: string): number {
    const multipliers = { '7d': 0.1, '30d': 0.5, '90d': 1.5, '365d': 6, 'all': 15 };
    const baseValue = 3;
    return Math.floor(baseValue * (multipliers[period] || 1));
  }

  exportInsightsCSV(insights: ProfileInsights): string {
    const headers = ['Metric', 'Value', 'Period'];
    const rows = [
      ['Posts', insights.creator.posts.toString(), insights.period],
      ['Likes', insights.creator.likes.toString(), insights.period],
      ['Comments', insights.creator.comments.toString(), insights.period],
      ['Follower Change', insights.creator.followersDelta.toString(), insights.period],
    ];

    if (insights.buyer) {
      rows.push(
        ['Purchases', insights.buyer.purchases.toString(), insights.period],
        ['Total Spent', `${insights.buyer.totalSpent.amount / 100} ${insights.buyer.totalSpent.currency}`, insights.period],
      );
    }

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
}

export const insightsClient = new InsightsClient();