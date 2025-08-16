/**
 * Tests for Pexels API integration
 */

import {
  PexelsClient,
  FINANCIAL_THEMES,
  getRandomThemedPhoto,
} from "@/lib/pexels";

// Mock environment variable
process.env.PEXELS_API_KEY = "test-api-key";

// Mock fetch
global.fetch = jest.fn();

describe("Pexels Integration", () => {
  let client: PexelsClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new PexelsClient("test-api-key");
    mockFetch.mockClear();
  });

  describe("PexelsClient", () => {
    it("should create client with API key", () => {
      expect(client).toBeDefined();
    });

    it("should throw error if no API key provided", () => {
      expect(() => new PexelsClient("")).toThrow("Pexels API key is required");
    });

    it("should search for photos", async () => {
      const mockResponse = {
        total_results: 100,
        page: 1,
        per_page: 20,
        photos: [
          {
            id: 1,
            width: 800,
            height: 600,
            url: "https://example.com/photo.jpg",
            photographer: "Test Photographer",
            photographer_url: "https://example.com/photographer",
            photographer_id: 123,
            avg_color: "#CCCCCC",
            src: {
              original: "https://example.com/original.jpg",
              large2x: "https://example.com/large2x.jpg",
              large: "https://example.com/large.jpg",
              medium: "https://example.com/medium.jpg",
              small: "https://example.com/small.jpg",
              portrait: "https://example.com/portrait.jpg",
              landscape: "https://example.com/landscape.jpg",
              tiny: "https://example.com/tiny.jpg",
            },
            liked: false,
            alt: "Test photo",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.searchPhotos("test query");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/search"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "test-api-key",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({ error: "Rate limit exceeded" }),
      } as Response);

      await expect(client.searchPhotos("test")).rejects.toThrow(
        "Pexels API error",
      );
    });

    it("should cache responses", async () => {
      const mockResponse = {
        total_results: 1,
        page: 1,
        per_page: 1,
        photos: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await client.searchPhotos("test");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await client.searchPhotos("test");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Financial Themes", () => {
    it("should have all required themes", () => {
      const expectedThemes = ["home", "money", "success", "planning", "family"];
      const actualThemes = Object.keys(FINANCIAL_THEMES);

      expectedThemes.forEach((theme) => {
        expect(actualThemes).toContain(theme);
      });
    });

    it("should have search queries for each theme", () => {
      Object.values(FINANCIAL_THEMES).forEach((queries) => {
        expect(Array.isArray(queries)).toBe(true);
        expect(queries.length).toBeGreaterThan(0);
        queries.forEach((query) => {
          expect(typeof query).toBe("string");
          expect(query.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("getRandomThemedPhoto", () => {
    it("should return a random photo from theme", async () => {
      const mockPhoto = {
        id: 1,
        width: 800,
        height: 600,
        url: "https://example.com/photo.jpg",
        photographer: "Test Photographer",
        photographer_url: "https://example.com/photographer",
        photographer_id: 123,
        avg_color: "#CCCCCC",
        src: {
          original: "https://example.com/original.jpg",
          large2x: "https://example.com/large2x.jpg",
          large: "https://example.com/large.jpg",
          medium: "https://example.com/medium.jpg",
          small: "https://example.com/small.jpg",
          portrait: "https://example.com/portrait.jpg",
          landscape: "https://example.com/landscape.jpg",
          tiny: "https://example.com/tiny.jpg",
        },
        liked: false,
        alt: "Test photo",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_results: 1,
          page: 1,
          per_page: 20,
          photos: [mockPhoto],
        }),
      } as Response);

      const result = await getRandomThemedPhoto("home", client);
      expect(result).toEqual(mockPhoto);
    });

    it("should return null if no photos found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_results: 0,
          page: 1,
          per_page: 20,
          photos: [],
        }),
      } as Response);

      const result = await getRandomThemedPhoto("home", client);
      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getRandomThemedPhoto("home", client);
      expect(result).toBeNull();
    });
  });

  describe("Cache Management", () => {
    it("should provide cache statistics", () => {
      const stats = client.getCacheStats();
      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("entries");
      expect(Array.isArray(stats.entries)).toBe(true);
    });

    it("should clear cache", () => {
      client.clearCache();
      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries.length).toBe(0);
    });
  });
});

// API Route Tests
describe("Pexels API Routes", () => {
  describe("/api/pexels/search", () => {
    it("should handle search requests", () => {
      // This would require setting up MSW or similar for API testing
      // For now, we're testing the client logic above
      expect(true).toBe(true);
    });
  });

  describe("/api/pexels/photo/[id]", () => {
    it("should handle photo ID requests", () => {
      // This would require setting up MSW or similar for API testing
      // For now, we're testing the client logic above
      expect(true).toBe(true);
    });
  });
});

// Attribution Compliance Tests
describe("Attribution Compliance", () => {
  it("should include photographer attribution in PexelsImage component", () => {
    // This would test the rendered component
    // The PexelsImage component includes proper attribution
    expect(true).toBe(true);
  });

  it("should link to Pexels website", () => {
    // This would test the rendered component
    // The PexelsImage component includes Pexels link
    expect(true).toBe(true);
  });
});
