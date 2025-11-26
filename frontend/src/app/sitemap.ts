import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iws-inky.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];

  try {
    // Fetch all questions from API
    const response = await fetch(`${apiUrl}/api/posts?per_page=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error('Failed to fetch posts for sitemap');
      return staticPages;
    }

    const data = await response.json();
    const questions = data.data || [];

    const questionUrls = questions.map((question: any) => ({
      url: `${baseUrl}/questions/${question.id}`,
      lastModified: new Date(question.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...questionUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
