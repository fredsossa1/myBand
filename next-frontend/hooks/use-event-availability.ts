"use client";

import { useState, useCallback, useMemo } from "react";
import { useAppData, useSetAvailability } from "@/lib/api-hooks";
import {
  AvailabilityState,
  Member,
  Event,
  AvailabilityRecord,
} from "@/lib/types";

export interface PendingChange {
  eventId: number;
  personId: string;
  state: AvailabilityState;
  previousState: AvailabilityState;
}

export interface UndoAction {
  type: "availability";
  eventId: number;
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
  [eventId: number]: {
    [personId: string]: LocalAvailabilityData;
  };
}

export interface UseEventAvailabilityReturn {
  // Data
  members: Member[] | undefined;
  event: Event | undefined;
  availability: AvailabilityRecord[] | undefined;
  availabilityByRole: Record<string, Array<{ id: string; name: string; state: string }>> | undefined;
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
    personId: string,
    state: AvailabilityState
  ) => void;
  setAvailabilityRemote: (
    personId: string,
    state: AvailabilityState
  ) => Promise<void>;
  submitAllChanges: () => Promise<void>;
  discardAllChanges: () => void;

  // Undo functionality
  lastAction: UndoAction | null;
  undoLastAction: () => Promise<boolean>;

  // Utilities
  refetch: () => Promise<void>;
  cycle: (state: AvailabilityState) => AvailabilityState;
  getUserAvailability: (userId: string) => AvailabilityState | null;
}

/**
 * Event-specific availability hook for managing availability for a single event
 */
export function useEventAvailability(eventId: number): UseEventAvailabilityReturn {
  // Base data from API - fetch data specific to this event
  const { members, events, availability, availabilityByRole, loading, error, refetch } =
    useAppData(eventId);
  const { mutate: setAvailabilityAPI, loading: settingAvailability } =
    useSetAvailability();

  // Find the specific event
  const event = events?.find(e => e.id === eventId);

  // Filter availability records for this specific event
  const eventAvailability = useMemo(() => {
    return availability?.filter(a => a.event_id === eventId) || [];
  }, [availability, eventId]);

  // Get availability by role for this event (already filtered by API)
  const eventAvailabilityByRole = useMemo(() => {
    return availabilityByRole && event ? (availabilityByRole as any)[event.date] : undefined;
  }, [availabilityByRole, event]);

  // Local state
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PendingChange>
  >(new Map());
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [localAvailability, setLocalAvailability] =
    useState<LocalAvailabilityState>({});

  const hasUnsavedChanges = pendingChanges.size > 0;

  // Cycle through availability states
  const cycle = useCallback(
    (state: AvailabilityState | null): AvailabilityState => {
      // If untouched (null), start with Available
      if (state === null) return "A";
      // Otherwise cycle: ? -> A -> U -> ?
      return state === "?" ? "A" : state === "A" ? "U" : "?";
    },
    []
  );

  // Get user's availability for this specific event
  const getUserAvailability = useCallback(
    (userId: string): AvailabilityState | null => {
      // Check local changes first
      const localData = localAvailability[eventId]?.[userId];
      if (localData) return localData.state;

      // Fall back to server data
      const record = eventAvailability.find(a => a.person_id === userId);
      return record ? record.state : null;
    },
    [localAvailability, eventId, eventAvailability]
  );

  // Set availability locally (for immediate UI feedback)
  const setAvailabilityLocal = useCallback(
    (personId: string, state: AvailabilityState) => {
      const previousState = getUserAvailability(personId);

      // Add to pending changes
      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(`${eventId}-${personId}`, {
          eventId,
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
          [eventId]: {
            ...prev[eventId],
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
    [getUserAvailability, members, eventId]
  );

  // Set availability remotely (save to server)
  const setAvailabilityRemote = useCallback(
    async (personId: string, state: AvailabilityState) => {
      const previousState = getUserAvailability(personId);

      try {
        // Store for undo
        setLastAction({
          type: "availability",
          eventId,
          personId,
          previousState: previousState || "?",
          newState: state,
        });

        // Use eventId directly instead of trying to find by date
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
          if (newLocal[eventId]) {
            delete newLocal[eventId][personId];
            if (Object.keys(newLocal[eventId]).length === 0) {
              delete newLocal[eventId];
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
    [getUserAvailability, setAvailabilityAPI, refetch, eventId]
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
    event,
    availability: eventAvailability,
    availabilityByRole: eventAvailabilityByRole,
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

    // Undo functionality
    lastAction,
    undoLastAction,

    // Utilities
    refetch,
    cycle,
    getUserAvailability,
  };
}