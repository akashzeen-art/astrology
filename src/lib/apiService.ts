import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS, FEATURES } from "./config";

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone_number?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  gender?: string;
  timezone: string;
  current_plan: string;
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  total_readings: number;
  accuracy_score: number;
  favorite_reading_type?: string;
  member_since: string;
  email_notifications: boolean;
  daily_horoscope: boolean;
  marketing_emails: boolean;
  profile_visibility: string;
  is_premium: boolean;
  readings_this_month: number;
  date_joined: string;
  last_login?: string;
}

export interface Reading {
  id: string;
  user: string;
  type: "palm_analysis" | "astrology_reading";
  status: "pending" | "analyzing" | "completed" | "failed";
  accuracy: number;
  created_at: string;
  updated_at: string;
  results?: any;
}

export interface PalmReading extends Reading {
  type: "palm_analysis";
  image_url?: string;
  upload_id?: string;
  palm_features?: {
    life_line: any;
    heart_line: any;
    head_line: any;
    fate_line: any;
  };
}

export interface AstrologyReading extends Reading {
  type: "astrology_reading";
  birth_data: {
    date: string;
    time: string;
    place: string;
    timezone: string;
  };
  birth_chart?: any;
}

export interface DashboardData {
  recent_readings: Reading[];
  weekly_activity: Array<{
    day: string;
    readings: number;
    accuracy: number;
  }>;
  spiritual_progress: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  user_stats: {
    total_readings: number;
    readings_this_month: number;
    readings_this_week: number;
    average_accuracy: number;
    favorite_reading_type: string;
    member_since: string;
    subscription_days_left: number;
    last_reading_date: string;
    total_insights_generated: number;
  };
}

// Mock API Data - Always available as fallback
const MOCK_USER: User = {
  id: "user_123",
  email: "demo@palmastro.com",
  username: "demo_user",
  first_name: "Demo",
  last_name: "User",
  timezone: "UTC",
  current_plan: "stellar_seeker",
  subscription_status: "active",
  total_readings: 47,
  accuracy_score: 94.5,
  member_since: "2024-01-01T00:00:00Z",
  email_notifications: true,
  daily_horoscope: true,
  marketing_emails: false,
  profile_visibility: "private",
  is_premium: true,
  readings_this_month: 12,
  date_joined: "2024-01-01T00:00:00Z",
};

const MOCK_DASHBOARD_DATA: DashboardData = {
  recent_readings: [
    {
      id: "reading_1",
      user: "user_123",
      type: "palm_analysis",
      status: "completed",
      accuracy: 96,
      created_at: "2024-01-20T10:30:00Z",
      updated_at: "2024-01-20T10:35:00Z",
    },
    {
      id: "reading_2",
      user: "user_123",
      type: "astrology_reading",
      status: "completed",
      accuracy: 92,
      created_at: "2024-01-19T15:20:00Z",
      updated_at: "2024-01-19T15:25:00Z",
    },
  ],
  weekly_activity: [
    { day: "Mon", readings: 2, accuracy: 95 },
    { day: "Tue", readings: 1, accuracy: 98 },
    { day: "Wed", readings: 3, accuracy: 92 },
    { day: "Thu", readings: 1, accuracy: 89 },
    { day: "Fri", readings: 4, accuracy: 96 },
    { day: "Sat", readings: 2, accuracy: 94 },
    { day: "Sun", readings: 1, accuracy: 91 },
  ],
  spiritual_progress: [
    { name: "Self-Awareness", value: 85, color: "#8852E0" },
    { name: "Intuition", value: 78, color: "#7575F0" },
    { name: "Spiritual Growth", value: 92, color: "#D4AF37" },
    { name: "Inner Peace", value: 67, color: "#9F7AEA" },
  ],
  user_stats: {
    total_readings: 47,
    readings_this_month: 12,
    readings_this_week: 3,
    average_accuracy: 94.5,
    favorite_reading_type: "Palm Analysis",
    member_since: "2024-01-15T00:00:00Z",
    subscription_days_left: 25,
    last_reading_date: "2024-01-20T10:30:00Z",
    total_insights_generated: 376,
  },
};

class PalmAstroAPIService {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  // Always use mock API if enabled, skip network calls entirely
  private shouldUseMockAPI(): boolean {
    return FEATURES.MOCK_API;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate realistic API response time
    await this.delay(Math.random() * 1000 + 500);
  }

  // Mock API implementations
  private async mockLogin(
    email: string,
    password: string,
  ): Promise<{ user: User; tokens: { access: string; refresh: string } }> {
    await this.simulateNetworkDelay();

    // Store tokens in localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, "mock_access_token");
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "mock_refresh_token");
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(MOCK_USER));

    return {
      user: MOCK_USER,
      tokens: {
        access: "mock_access_token",
        refresh: "mock_refresh_token",
      },
    };
  }

  private async mockGetProfile(): Promise<User> {
    await this.simulateNetworkDelay();
    return MOCK_USER;
  }

  private async mockGetDashboard(): Promise<DashboardData> {
    await this.simulateNetworkDelay();
    return MOCK_DASHBOARD_DATA;
  }

  private async mockUploadPalmImage(
    file: File,
  ): Promise<{ upload_id: string; image_url: string }> {
    await this.simulateNetworkDelay();
    return {
      upload_id: `upload_${Date.now()}`,
      image_url: URL.createObjectURL(file),
    };
  }

  private async mockAnalyzePalm(uploadId: string): Promise<PalmReading> {
    // Simulate analysis time
    await this.delay(3000);

    return {
      id: `reading_${Date.now()}`,
      user: "user_123",
      type: "palm_analysis",
      status: "completed",
      accuracy: 94,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upload_id: uploadId,
      results: {
        overall_score: 94,
        personality_traits: [
          "Creative and imaginative",
          "Strong leadership qualities",
          "Compassionate nature",
          "Detail-oriented",
        ],
        life_events: [
          { age: 25, event: "Career breakthrough", probability: 85 },
          { age: 30, event: "Significant relationship", probability: 78 },
          { age: 35, event: "Major life change", probability: 92 },
        ],
        palm_features: {
          life_line: {
            quality: "Strong",
            score: 92,
            meaning: "Excellent vitality and long life",
            details:
              "Your life line is deep and well-formed, indicating robust health and strong life force.",
          },
          heart_line: {
            quality: "Curved",
            score: 88,
            meaning: "Emotional and expressive in love",
            details:
              "Your heart line curves upward, showing you're a romantic at heart.",
          },
          head_line: {
            quality: "Clear",
            score: 96,
            meaning: "Sharp intellect and analytical mind",
            details:
              "A clear, straight head line indicates logical thinking and good concentration.",
          },
          fate_line: {
            quality: "Present",
            score: 85,
            meaning: "Strong sense of purpose and direction",
            details:
              "The presence of a fate line suggests you have a clear life path.",
          },
        },
      },
    };
  }

  private async mockAstrologyReading(
    birthData: any,
  ): Promise<AstrologyReading> {
    // Simulate analysis time
    await this.delay(4000);

    return {
      id: `astro_${Date.now()}`,
      user: "user_123",
      type: "astrology_reading",
      status: "completed",
      accuracy: 91,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      birth_data: birthData,
      results: {
        sun_sign: "Leo",
        moon_sign: "Scorpio",
        rising_sign: "Gemini",
        personality_summary:
          "You are a natural leader with deep emotional intelligence and excellent communication skills.",
        life_path:
          "Your path involves creative self-expression and helping others realize their potential.",
        relationships:
          "You seek deep, transformative connections and are fiercely loyal to those you love.",
        career:
          "Success comes through leadership roles, creative pursuits, or fields involving communication.",
      },
    };
  }

  // Public API methods - always use mock if enabled
  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; tokens: { access: string; refresh: string } }> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: login");
      return this.mockLogin(email, password);
    }

    // If mock is disabled, attempt real API call with error handling
    try {
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockLogin(email, password);
    }
  }

  async getCurrentUser(): Promise<User> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: getCurrentUser");
      return this.mockGetProfile();
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.AUTH.PROFILE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Get profile failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockGetProfile();
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: getDashboardData");
      return this.mockGetDashboard();
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.AUTH.DASHBOARD}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Get dashboard failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockGetDashboard();
    }
  }

  async uploadPalmImage(
    file: File,
  ): Promise<{ upload_id: string; image_url: string }> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: uploadPalmImage");
      return this.mockUploadPalmImage(file);
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.READINGS.PALM_UPLOAD}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockUploadPalmImage(file);
    }
  }

  async analyzePalm(uploadId: string): Promise<PalmReading> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: analyzePalm");
      return this.mockAnalyzePalm(uploadId);
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.READINGS.PALM_ANALYZE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ upload_id: uploadId }),
        },
      );

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockAnalyzePalm(uploadId);
    }
  }

  async createAstrologyReading(birthData: any): Promise<AstrologyReading> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: createAstrologyReading");
      return this.mockAstrologyReading(birthData);
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.READINGS.ASTROLOGY_CREATE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ birth_data: birthData }),
        },
      );

      if (!response.ok) {
        throw new Error(`Astrology reading failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      return this.mockAstrologyReading(birthData);
    }
  }

  async getReadings(limit: number = 20): Promise<Reading[]> {
    if (this.shouldUseMockAPI()) {
      console.log("🎭 Using Mock API: getReadings");
      await this.simulateNetworkDelay();
      return MOCK_DASHBOARD_DATA.recent_readings.slice(0, limit);
    }

    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.READINGS.LIST}?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Get readings failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.warn("🚨 API call failed, falling back to mock:", error);
      await this.simulateNetworkDelay();
      return MOCK_DASHBOARD_DATA.recent_readings.slice(0, limit);
    }
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log("🚪 User logged out");
  }
}

// Export singleton instance
export const apiService = new PalmAstroAPIService();
export default apiService;
