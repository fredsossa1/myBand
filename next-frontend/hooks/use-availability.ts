"use client";

import { useState, useCallback, useMemo } from "react";
import { useAppData, useSetAvailability } from "@/lib/api-hooks";
import {
  AvailabilityState,
  Member,
  Event,
  AvailabilityRecord,
  AvailabilityByDate,
} from "@/lib/types";
import { groupAvailabilityByDate } from "@/lib/utils";

export interface PendingChange {
  eventId: number;
  date: string;
  personId: string;
  state: AvailabilityState;
  previousState: AvailabilityState;
}

export interface UndoAction {
  type: "availability";
  eventId: number;
  date: string;
  personId: string;
  previousState: AvailabilityState;
  newState: AvailabilityState;
}

export interface LocalAvailabilityData {
  state: AvailabilityState;
  name: string;
  role: string;
  isPending: boolean;
}

export interface LocalAvailabilityState {
  [date: string]: {
    [personId: string]: LocalAvailabilityData;
  };
}

export interface UseAvailabilityReturn {
  // Data
  members: Member[] | undefined;
  events: Event[] | undefined;
  availability: AvailabilityRecord[] | undefined;
  availabilityByDate: AvailabilityByDate;
  loading: boolean;
  error: string | null;

  // Current user state
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;

  // Pending changes management
  pendingChanges: Map<string, PendingChange>;
  hasUnsavedChanges: boolean;

  // Actions
  setAvailabilityLocal: (
    eventIdOrDate: string | number,
    personId: string,
    state: AvailabilityState
  ) => void;
  setAvailabilityRemote: (
    eventIdOrDate: string | number,
    personId: string,
    state: AvailabilityState
  ) => Promise<void>;
  submitAllChanges: () => Promise<void>;
  discardAllChanges: () => void;

  // Bulk operations
  setBulkAvailability: (
    dates: string[],
    personId: string,
    state: AvailabilityState
  ) => Promise<void>;

  // Undo functionality
  lastAction: UndoAction | null;
  undoLastAction: () => Promise<boolean>;

  // Utilities
  refetch: () => Promise<void>;
  cycle: (state: AvailabilityState) => AvailabilityState;
  getUserAvailability: (
    date: string,
    userId: string
  ) => AvailabilityState | null;
}

/**
 * Advanced availability hook that manages local state, pending changes, undo functionality,
 * and optimistic updates for the band availability system.
 */
export function useAvailability(): UseAvailabilityReturn {
  // Base data from API
  const { members, events, availability, loading, error, refetch } =
    useAppData();
  const { mutate: setAvailabilityAPI, loading: settingAvailability } =
    useSetAvailability();

  // Local state
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingChange>
  >(new Map());
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [localAvailability, setLocalAvailability] =
    useState<LocalAvailabilityState>({});

  // Transform array of availability records to grouped by date format
  const baseAvailabilityByDate = useMemo(() => {
    return groupAvailabilityByDate(availability || undefined, events || undefined);
  }, [availability, events]);

  // Merge server data with local optimistic updates
  const availabilityByDate = useMemo(() => {
    const merged = { ...baseAvailabilityByDate };

    Object.entries(localAvailability).forEach(([date, dateData]) => {
      if (!merged[date]) merged[date] = {};
      Object.entries(dateData).forEach(([personId, personData]) => {
        merged[date][personId] = personData.state;
      });
    });

    return merged;
  }, [baseAvailabilityByDate, localAvailability]);

  const hasUnsavedChanges = pendingChanges.size > 0;

  // Cycle through availability states (only when explicitly touched)
  const cycle = useCallback(
    (state: AvailabilityState | null): AvailabilityState => {
      // If untouched (null), start with Available
      if (state === null) return "A";
      // Otherwise cycle: ? -> A -> U -> ?
      return state === "?" ? "A" : state === "A" ? "U" : "?";
    },
    []
  );

  // Get user's availability for a specific date
  const getUserAvailability = useCallback(
    (date: string, userId: string): AvailabilityState | null => {
      // Check local changes first
      const localData = localAvailability[date]?.[userId];
      if (localData) return localData.state;

      // Fall back to server data
      return availabilityByDate[date]?.[userId] || null;
    },
    [localAvailability, availabilityByDate]
  );

  // Set availability locally (for immediate UI feedback)
  const setAvailabilityLocal = useCallback(
    (eventIdOrDate: string | number, personId: string, state: AvailabilityState) => {
      // Handle both event ID (new) and date (legacy) for backward compatibility
      let eventId: number;
      let date: string;
      
      if (typeof eventIdOrDate === 'number') {
        // New event-based approach
        eventId = eventIdOrDate;
        const event = events?.find(e => e.id === eventId);
        date = event?.date || '';
      } else {
        // Legacy date-based approach - find first event on that date
        date = eventIdOrDate;
        const event = events?.find(e => e.date === date);
        eventId = typeof event?.id === 'number' ? event.id : parseInt(event?.id || '0');
      }

      const previousState = getUserAvailability(date, personId);

      // Add to pending changes
      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(`${eventId}-${personId}`, {
          eventId,
          date,
          personId,
          state,
          previousState: previousState || "?",
        });
        return newChanges;
      });

      // Update local state for immediate UI feedback
      setLocalAvailability((prev: LocalAvailabilityState) => {
        const member = members?.find((m) => m.id === personId);
        return {
          ...prev,
          [date]: {
            ...prev[date],
            [personId]: {
              state,
              name: member?.name || "Unknown",
              role: member?.role || "unknown",
              isPending: true,
            },
          },
        };
      });
    },
    [getUserAvailability, members, events]
  );

  // Set availability remotely (save to server)
  const setAvailabilityRemote = useCallback(
    async (eventIdOrDate: string | number, personId: string, state: AvailabilityState) => {
      // Handle both event ID (new) and date (legacy)
      let eventId: number;
      let date: string;
      
      if (typeof eventIdOrDate === 'number') {
        eventId = eventIdOrDate;
        const event = events?.find(e => e.id === eventId);
        date = event?.date || '';
      } else {
        date = eventIdOrDate;
        const event = events?.find(e => e.date === date);
        eventId = typeof event?.id === 'number' ? event.id : parseInt(event?.id || '0');
      }

      const previousState = getUserAvailability(date, personId);

      try {
        // Store for undo
        setLastAction({
          type: "availability",
          eventId,
          date,
          personId,
          previousState: previousState || "?",
          newState: state,
        });

        await setAvailabilityAPI(eventId, personId, state);

        // Remove from pending changes if it exists
        setPendingChanges((prev) => {
          const newChanges = new Map(prev);
          newChanges.delete(`${eventId}-${personId}`);
          return newChanges;
        });

        // Clear local state for this item
        setLocalAvailability((prev: LocalAvailabilityState) => {
          const newLocal = { ...prev };
          if (newLocal[date]) {
            delete newLocal[date][personId];
            if (Object.keys(newLocal[date]).length === 0) {
              delete newLocal[date];
            }
          }
          return newLocal;
        });

        // Refresh data
        await refetch();
      } catch (error) {
        console.error("Failed to set availability:", error);
        throw error;
      }
    },
    [getUserAvailability, setAvailabilityAPI, refetch]
  );

  // Submit all pending changes
  const submitAllChanges = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    const changes = Array.from(pendingChanges.values());

    try {
      // Submit all changes in parallel
      await Promise.all(
        changes.map((change) =>
          setAvailabilityAPI(change.eventId, change.personId, change.state)
        )
      );

      // Clear all pending changes
      setPendingChanges(new Map());
      setLocalAvailability({});

      // Refresh data
      await refetch();
    } catch (error) {
      console.error("Failed to submit changes:", error);
      throw error;
    }
  }, [hasUnsavedChanges, pendingChanges, setAvailabilityAPI, refetch]);

  // Discard all pending changes
  const discardAllChanges = useCallback(() => {
    setPendingChanges(new Map());
    setLocalAvailability({});
  }, []);

  // Set bulk availability for multiple dates
  const setBulkAvailability = useCallback(
    async (dates: string[], personId: string, state: AvailabilityState) => {
      try {
        await Promise.all(
          dates.map((date) => setAvailabilityAPI(date, personId, state))
        );

        await refetch();
      } catch (error) {
        console.error("Failed to set bulk availability:", error);
        throw error;
      }
    },
    [setAvailabilityAPI, refetch]
  );

  // Undo last action
  const undoLastAction = useCallback(async (): Promise<boolean> => {
    if (!lastAction || lastAction.type !== "availability") return false;

    try {
      await setAvailabilityAPI(
        lastAction.eventId,
        lastAction.personId,
        lastAction.previousState
      );

      setLastAction(null);
      await refetch();
      return true;
    } catch (error) {
      console.error("Failed to undo:", error);
      return false;
    }
  }, [lastAction, setAvailabilityAPI, refetch]);

  return {
    // Data
    members: members || undefined,
    events: events || undefined,
    availability: availability || undefined,
    availabilityByDate,
    loading: loading || settingAvailability,
    error,

    // Current user state
    currentUser,
    setCurrentUser,

    // Pending changes
    pendingChanges,
    hasUnsavedChanges,

    // Actions
    setAvailabilityLocal,
    setAvailabilityRemote,
    submitAllChanges,
    discardAllChanges,

    // Bulk operations
    setBulkAvailability,

    // Undo functionality
    lastAction,
    undoLastAction,

    // Utilities
    refetch,
    cycle,
    getUserAvailability,
  };
}
