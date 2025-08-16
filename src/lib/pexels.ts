/**
 * Pexels API client for fetching stock photos
 * Documentation: https://www.pexels.com/api/documentation/
 */

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
  prev_page?: string;
}

export interface PexelsError {
  error: string;
  message?: string;
}

export class PexelsClient {
  private apiKey: string;
  private baseUrl = "https://api.pexels.com/v1";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Pexels API key is required");
    }
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const cacheKey = url.toString();

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Pexels API error: ${response.status} - ${errorData.error || response.statusText}`,
        );
      }

      const data = await response.json();

      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error("Pexels API request failed:", error);
      throw error;
    }
  }

  /**
   * Search for photos by query
   */
  async searchPhotos(
    query: string,
    options: {
      per_page?: number;
      page?: number;
      orientation?: "landscape" | "portrait" | "square";
      size?: "large" | "medium" | "small";
      color?:
        | "red"
        | "orange"
        | "yellow"
        | "green"
        | "turquoise"
        | "blue"
        | "violet"
        | "pink"
        | "brown"
        | "black"
        | "gray"
        | "white";
      locale?: string;
    } = {},
  ): Promise<PexelsSearchResponse> {
    const params = {
      query,
      per_page: options.per_page || 20,
      page: options.page || 1,
      ...(options.orientation && { orientation: options.orientation }),
      ...(options.size && { size: options.size }),
      ...(options.color && { color: options.color }),
      ...(options.locale && { locale: options.locale }),
    };

    return this.makeRequest<PexelsSearchResponse>("/search", params);
  }

  /**
   * Get curated photos
   */
  async getCuratedPhotos(
    options: {
      per_page?: number;
      page?: number;
    } = {},
  ): Promise<PexelsSearchResponse> {
    const params = {
      per_page: options.per_page || 20,
      page: options.page || 1,
    };

    return this.makeRequest<PexelsSearchResponse>("/curated", params);
  }

  /**
   * Get a specific photo by ID
   */
  async getPhoto(id: number): Promise<PexelsPhoto> {
    return this.makeRequest<PexelsPhoto>(`/photos/${id}`);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Financial and real estate themed search queries
export const FINANCIAL_THEMES = {
  home: [
    "modern house exterior",
    "beautiful home interior",
    "luxury house front",
    "family home exterior",
    "contemporary house design",
  ],
  money: [
    "money savings calculator",
    "financial planning desk",
    "investment growth chart",
    "money stack coins",
    "financial success concept",
  ],
  success: [
    "business success celebration",
    "financial achievement concept",
    "growth chart success",
    "happy family home",
    "achievement celebration",
  ],
  planning: [
    "financial planning meeting",
    "calculator with documents",
    "mortgage documents planning",
    "real estate consultation",
    "financial advisor meeting",
  ],
  family: [
    "happy family home",
    "family financial planning",
    "parents children house",
    "family savings concept",
    "family home ownership",
  ],
} as const;

/**
 * Get a random photo from a themed collection
 */
export async function getRandomThemedPhoto(
  theme: keyof typeof FINANCIAL_THEMES,
  client: PexelsClient,
  options: {
    orientation?: "landscape" | "portrait" | "square";
    size?: "large" | "medium" | "small";
  } = {},
): Promise<PexelsPhoto | null> {
  try {
    const queries = FINANCIAL_THEMES[theme];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    const result = await client.searchPhotos(randomQuery, {
      per_page: 20,
      page: 1,
      ...options,
    });

    if (result.photos.length === 0) {
      return null;
    }

    // Return a random photo from the results
    const randomIndex = Math.floor(Math.random() * result.photos.length);
    return result.photos[randomIndex];
  } catch (error) {
    console.error(`Failed to get themed photo for ${theme}:`, error);
    return null;
  }
}

// Create a singleton instance
let pexelsClient: PexelsClient | null = null;

export function getPexelsClient(): PexelsClient {
  if (!pexelsClient) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      throw new Error("PEXELS_API_KEY environment variable is not set");
    }
    pexelsClient = new PexelsClient(apiKey);
  }
  return pexelsClient;
}

export default PexelsClient;
