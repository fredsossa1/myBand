// React-specific API utilities and hooks
"use client";

import { useState, useEffect, useCallback } from "react";
import BandApi, { ApiError, isApiError } from "./api";
import {
  Member,
  MembersByRole,
  Event,
  AvailabilityRecord,
  AvailabilityByRole,
  CreateEventForm,
  BulkAvailabilityUpdate,
} from "./types";

// Generic hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Generic hook for API calls
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Unknown error occurred";
      setError(errorMessage);
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ========== MEMBER HOOKS ==========

/**
 * Hook to fetch all members
 */
export function useMembers(): UseApiState<Member[]> {
  return useApiCall(() => BandApi.getMembers());
}

/**
 * Hook to fetch members organized by role
 */
export function useMembersByRole(): UseApiState<MembersByRole> {
  return useApiCall(() => BandApi.getMembersByRole());
}

// ========== EVENT HOOKS ==========

/**
 * Hook to fetch all events
 */
export function useEvents(): UseApiState<Event[]> {
  return useApiCall(() => BandApi.getEvents());
}

/**
 * Hook to fetch dates (legacy)
 */
export function useDates(): UseApiState<string[]> {
  return useApiCall(() => BandApi.getDates());
}

// ========== AVAILABILITY HOOKS ==========

/**
 * Hook to fetch all availability records
 */
export function useAvailability(): UseApiState<AvailabilityRecord[]> {
  return useApiCall(() => BandApi.getAvailability());
}

/**
 * Hook to fetch availability organized by role
 */
export function useAvailabilityByRole(): UseApiState<AvailabilityByRole> {
  return useApiCall(() => BandApi.getAvailabilityByRole());
}

// ========== MUTATION HOOKS ==========

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (...args: any[]) => Promise<T>;
  reset: () => void;
}

function useMutation<T, TArgs extends any[]>(
  apiCall: (...args: TArgs) => Promise<T>
): UseMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Unknown error occurred";
        setError(errorMessage);
        console.error("Mutation failed:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

/**
 * Hook for setting individual availability
 */
export function useSetAvailability() {
  return useMutation(
    (date: string, personId: string, state: "A" | "U" | "?") =>
      BandApi.setAvailability(date, personId, state)
  );
}

/**
 * Hook for bulk availability updates
 */
export function useBulkSetAvailability() {
  return useMutation((update: BulkAvailabilityUpdate) =>
    BandApi.setBulkAvailability(update)
  );
}

/**
 * Hook for adding events (admin)
 */
export function useAddEvent() {
  return useMutation((password: string, event: CreateEventForm) =>
    BandApi.addEvent(password, event)
  );
}

/**
 * Hook for adding dates
 */
export function useAddDate() {
  return useMutation((date: string) => BandApi.addDate(date));
}

/**
 * Hook for adding date ranges
 */
export function useAddDateRange() {
  return useMutation((start: string, end: string, stepDays: number = 7) =>
    BandApi.addDateRange(start, end, stepDays)
  );
}

/**
 * Hook for admin verification
 */
export function useVerifyAdmin() {
  return useMutation((password: string) => BandApi.verifyAdmin(password));
}

/**
 * Hook for data reset (admin)
 */
export function useResetData() {
  return useMutation((password: string) => BandApi.resetData(password));
}

// ========== COMBINED HOOKS ==========

/**
 * Combined hook that fetches all core data needed for the app
 */
export function useAppData() {
  const members = useMembers();
  const events = useEvents();
  const availability = useAvailability();

  const loading = members.loading || events.loading || availability.loading;
  const error = members.error || events.error || availability.error;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      members.refetch(),
      events.refetch(),
      availability.refetch(),
    ]);
  }, [members.refetch, events.refetch, availability.refetch]);

  return {
    members: members.data,
    events: events.data,
    availability: availability.data,
    loading,
    error,
    refetch: refetchAll,
  };
}

/**
 * Hook for API health monitoring
 */
export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const healthy = await BandApi.healthCheck();
      setIsHealthy(healthy);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth,
  };
}

// ========== EXPORT HOOKS ==========

/**
 * Hook for CSV export functionality
 */
export function useCsvExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCsv = useCallback(async () => {
    try {
      setExporting(true);
      setError(null);
      await BandApi.downloadCsvExport();
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : "Export failed";
      setError(errorMessage);
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportCsv,
    exporting,
    error,
  };
}

/**
 * Hook for summary export functionality
 */
export function useSummaryExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSummary = useCallback(async () => {
    try {
      setExporting(true);
      setError(null);
      await BandApi.downloadSummaryExport();
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : "Export failed";
      setError(errorMessage);
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportSummary,
    exporting,
    error,
  };
}
