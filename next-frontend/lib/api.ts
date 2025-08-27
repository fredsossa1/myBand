// API client for connecting to the Express backend
import {
  Member,
  MembersByRole,
  Event,
  AvailabilityRecord,
  AvailabilityByRole,
  CreateEventForm,
  BulkAvailabilityUpdate,
  ApiResponse,
} from "./types";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5173";

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public response?: any;

  constructor(message: string, status: number, response?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

// Base fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

    const response = await fetch(url, defaultOptions);

    // Handle non-JSON responses (like CSV exports)
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      const errorMessage = data?.error || `HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    console.log(`✅ API Response: ${response.status}`, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    console.error(`❌ API Error: ${url}`, error);
    throw new ApiError(
      `Failed to connect to server: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
}

// GET request helper
async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

// POST request helper
async function post<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// API Client Class
export class BandApi {
  // ========== MEMBERS ==========

  /**
   * Get all members as a flat array
   */
  static async getMembers(): Promise<Member[]> {
    return get<Member[]>("/api/members");
  }

  /**
   * Get members organized by role
   */
  static async getMembersByRole(): Promise<MembersByRole> {
    return get<MembersByRole>("/api/members/by-role");
  }

  // ========== EVENTS ==========

  /**
   * Get all events
   */
  static async getEvents(): Promise<Event[]> {
    return get<Event[]>("/api/events");
  }

  /**
   * Get all dates (legacy endpoint)
   */
  static async getDates(): Promise<string[]> {
    return get<string[]>("/api/dates");
  }

  /**
   * Add a single date
   */
  static async addDate(date: string): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/api/dates", { date });
  }

  /**
   * Add a range of dates
   */
  static async addDateRange(
    start: string,
    end: string,
    stepDays: number = 7
  ): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/api/dates/range", { start, end, stepDays });
  }

  // ========== AVAILABILITY ==========

  /**
   * Get all availability records
   */
  static async getAvailability(): Promise<AvailabilityRecord[]> {
    return get<AvailabilityRecord[]>("/api/availability");
  }

  /**
   * Get availability organized by role and date
   */
  static async getAvailabilityByRole(): Promise<AvailabilityByRole> {
    return get<AvailabilityByRole>("/api/availability/by-role");
  }

  /**
   * Set availability for a specific person and date
   */
  static async setAvailability(
    date: string,
    personId: string,
    state: "A" | "U" | "?"
  ): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/api/availability", {
      date,
      personId,
      state,
    });
  }

  // ========== ADMIN OPERATIONS ==========

  /**
   * Verify admin password
   */
  static async verifyAdmin(password: string): Promise<{ isAdmin: boolean }> {
    return post<{ isAdmin: boolean }>("/api/admin/verify", { password });
  }

  /**
   * Add a new event (admin only)
   */
  static async addEvent(
    password: string,
    event: CreateEventForm
  ): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/api/admin/events", { password, event });
  }

  /**
   * Reset all data (admin only)
   */
  static async resetData(password: string): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/api/reset", { password });
  }

  // ========== EXPORT ==========

  /**
   * Export data as CSV
   */
  static async exportCsv(): Promise<string> {
    return get<string>("/api/export/csv");
  }

  /**
   * Export availability summary as text
   */
  static async exportSummary(): Promise<string> {
    return get<string>("/api/export/summary");
  }

  // ========== UTILITY METHODS ==========

  /**
   * Bulk set availability for multiple members and dates
   * (Client-side implementation using multiple API calls)
   */
  static async setBulkAvailability(
    update: BulkAvailabilityUpdate
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Execute all combinations of dates and members
    for (const date of update.dates) {
      for (const memberId of update.memberIds) {
        try {
          await this.setAvailability(date, memberId, update.state);
          results.success++;
        } catch (error) {
          results.failed++;
          const errorMessage =
            error instanceof ApiError ? error.message : "Unknown error";
          results.errors.push(`${date} - ${memberId}: ${errorMessage}`);
        }
      }
    }

    return results;
  }

  /**
   * Download CSV export as file
   */
  static async downloadCsvExport(): Promise<void> {
    try {
      const csvData = await this.exportCsv();
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `band-availability-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new ApiError("Failed to download CSV export", 0);
    }
  }

  /**
   * Download summary export as file
   */
  static async downloadSummaryExport(): Promise<void> {
    try {
      const summaryData = await this.exportSummary();
      const blob = new Blob([summaryData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `band-availability-summary-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new ApiError("Failed to download summary export", 0);
    }
  }

  /**
   * Health check - test if the API is responding
   */
  static async healthCheck(): Promise<boolean> {
    try {
      await this.getMembers();
      return true;
    } catch (error) {
      console.warn("API health check failed:", error);
      return false;
    }
  }
}

// Helper functions for error handling
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

// Export the API client as default
export default BandApi;
