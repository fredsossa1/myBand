"use client";

import { useState, useEffect } from "react";
import { useAvailability, useBandKeyboardShortcuts } from "@/hooks";
import { useTranslations } from "@/hooks/use-language";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getAvailabilityIconOrDefault,
  getAvailabilityDisplayNameOrDefault,
  getRoleDisplayName,
  formatDate,
} from "@/lib/constants";
import {
  groupMembersByRole,
  calculateEventCoverage,
  getCoverageStatusIcon,
  getCoverageStatusColor,
  formatEventType,
} from "@/lib/utils";
import { Role, AvailabilityState, Member, EventType } from "@/lib/types";

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dates: string[], state: AvailabilityState) => void;
  events: any[];
  state: AvailabilityState;
}

function BulkActionModal({
  isOpen,
  onClose,
  onApply,
  events,
  state,
}: BulkActionModalProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const t = useTranslations();

  const stateText =
    state === "A" ? t.available : state === "U" ? t.unavailable : t.uncertain;

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const selectAll = () => {
    const allDates = events.map((e) => e.date);
    setSelectedDates((prev) =>
      prev.length === allDates.length ? [] : allDates
    );
  };

  const handleApply = () => {
    if (selectedDates.length > 0) {
      onApply(selectedDates, state);
      setSelectedDates([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/20 max-w-md w-[calc(100vw-2rem)] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-sm sm:text-base">
            🎯 {t.bulkSetTitle.replace("{state}", stateText)}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs sm:text-sm">
            {t.bulkSelectEvents}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={selectAll}
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {selectedDates.length === events.length
              ? t.deselectAll
              : t.selectAll}
          </Button>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`bulk_${event.date}`}
                  checked={selectedDates.includes(event.date)}
                  onChange={() => toggleDate(event.date)}
                  className="rounded"
                />
                <label
                  htmlFor={`bulk_${event.date}`}
                  className="text-white text-sm cursor-pointer flex-1"
                >
                  {event.title} - {formatDate(event.date)}
                </label>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleApply}
              disabled={selectedDates.length === 0}
              className={`order-1 sm:order-2 flex-1 text-white text-sm ${
                state === "A"
                  ? "bg-green-600 hover:bg-green-700"
                  : state === "U"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              Set {stateText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (eventData: {
    date: string;
    title: string;
    description?: string;
    type?: string;
  }) => void;
}

function AddEventModal({ isOpen, onClose, onAdd }: AddEventModalProps) {
  const [eventData, setEventData] = useState({
    date: "",
    title: "Service",
    description: "",
    type: "service",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const handleSubmit = async () => {
    if (!eventData.date || !eventData.title) return;

    setIsSubmitting(true);
    try {
      await onAdd(eventData);
      setEventData({
        date: "",
        title: "Service",
        description: "",
        type: "service",
      });
      onClose();
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/20 max-w-md w-[calc(100vw-2rem)] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-sm sm:text-base">
            📅 {t.addNewEvent}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs sm:text-sm">
            {t.addEventDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-white text-xs sm:text-sm font-medium block">
              {t.date}
            </label>
            <Input
              type="date"
              value={eventData.date}
              min={today}
              onChange={(e) =>
                setEventData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-white text-xs sm:text-sm font-medium block">
              {t.eventTitle}
            </label>
            <Input
              type="text"
              value={eventData.title}
              onChange={(e) =>
                setEventData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t.eventTitlePlaceholder}
              className="bg-white/10 border-white/20 text-white mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-white text-xs sm:text-sm font-medium block">
              {t.descriptionOptional}
            </label>
            <Input
              type="text"
              value={eventData.description}
              onChange={(e) =>
                setEventData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t.eventDescriptionPlaceholder}
              className="bg-white/10 border-white/20 text-white mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-white text-xs sm:text-sm font-medium block">
              {t.eventType}
            </label>
            <Select
              value={eventData.type}
              onValueChange={(value) =>
                setEventData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">{t.service}</SelectItem>
                <SelectItem value="band-only">{t.bandOnly}</SelectItem>
                <SelectItem value="jam-session">{t.jamSession}</SelectItem>
                <SelectItem value="special-event">{t.specialEvent}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="order-2 sm:order-1 flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!eventData.date || !eventData.title || isSubmitting}
              className="order-1 sm:order-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {isSubmitting ? t.adding : t.addEvent}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AvailabilityPage() {
  const t = useTranslations();

  const [bulkModal, setBulkModal] = useState<{
    isOpen: boolean;
    state: AvailabilityState;
  }>({
    isOpen: false,
    state: "A",
  });
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);

  const { isAdmin, handleAdminLogout } = useAdmin();

  const {
    members,
    events,
    availabilityByDate,
    loading,
    error,
    currentUser,
    setCurrentUser,
    pendingChanges,
    hasUnsavedChanges,
    setAvailabilityLocal,
    setAvailabilityRemote,
    submitAllChanges,
    discardAllChanges,
    undoLastAction,
    lastAction,
    refetch,
    cycle,
    getUserAvailability,
    setBulkAvailability,
  } = useAvailability();

  // Setup keyboard shortcuts
  useBandKeyboardShortcuts({
    refresh: refetch,
    undo: () => undoLastAction(),
    save: () => hasUnsavedChanges && submitAllChanges(),
    toggleUser: () => setCurrentUser(currentUser ? null : members?.[0] || null),
    openHelp: () => setShowKeyboardHelp(true),
  });

  const handleAddEvent = async (eventData: {
    date: string;
    title: string;
    description?: string;
    type?: string;
  }) => {
    if (!isAdmin) {
      alert(t.adminAccessRequired);
      return;
    }

    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      alert(t.adminSessionExpired);
      handleAdminLogout();
      return;
    }

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminSession,
          event: eventData,
        }),
      });

      if (response.ok) {
        await refetch(); // Refresh events list
      } else {
        const error = await response.json();
        alert(error.error || t.failedToAddEvent);

        // If admin access is denied, logout
        if (response.status === 403) {
          handleAdminLogout();
        }
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert(t.failedToAddEvent);
    }
  };

  const membersByRole = groupMembersByRole(members);

  // Calculate stats
  const stats = {
    totalEvents: events?.length || 0,
    totalMembers: members?.length || 0,
    totalResponses: 0,
    userResponses: 0,
  };

  if (events && members) {
    events.forEach((event) => {
      const dayAvail = availabilityByDate[event.date] || {};
      Object.values(dayAvail).forEach((state) => {
        if (state) stats.totalResponses++; // Include all responses (A, U, and ?)
      });

      if (currentUser && dayAvail[currentUser.id]) {
        stats.userResponses++; // Include all user responses (A, U, and ?)
      }
    });
  }

  const overallRate =
    stats.totalMembers && stats.totalEvents
      ? Math.round(
          (stats.totalResponses / (stats.totalMembers * stats.totalEvents)) *
            100
        )
      : 0;
  const userRate =
    currentUser && stats.totalEvents
      ? Math.round((stats.userResponses / stats.totalEvents) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="glass border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-xl">{t.loadingAvailabilityData}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="glass border-red-500/20">
            <CardContent className="p-12 text-center">
              <div className="text-red-400">
                <div className="text-4xl mb-4">❌</div>
                <p className="text-xl">
                  {t.errorLoadingData}: {error}
                </p>
                <Button onClick={refetch} className="mt-4" variant="outline">
                  {t.tryAgain}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <span className="text-3xl">🎵</span>
                {t.appTitle}
              </CardTitle>
              <p className="text-white/70 mt-2">{t.appSubtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardHelp(true)}
                className="hidden sm:flex bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ⌨️ {t.keyboardShortcuts}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                🔄 {t.refresh}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Add Event Button */}
      {isAdmin && (
        <Card className="glass border-green-500/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-white">
                <div className="font-semibold text-green-300 text-sm sm:text-base">
                  🔑 {t.adminControls}
                </div>
                <div className="text-xs sm:text-sm text-white/70">
                  {t.adminManageDescription}
                </div>
              </div>
              <Button
                onClick={() => setAddEventModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white self-start sm:self-auto text-sm"
                size="sm"
              >
                📅 <span className="hidden sm:inline">{t.addEvent}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Selection */}
      <Card className="glass border-white/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Select
                value={currentUser?.id || ""}
                onValueChange={(id) => {
                  const user = members?.find((m) => m.id === id);
                  setCurrentUser(user || null);
                }}
              >
                <SelectTrigger className="w-full sm:w-64 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={t.selectName} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(membersByRole).map(
                    ([role, people]) =>
                      people.length > 0 && (
                        <div key={role}>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase">
                            {getRoleDisplayName(role as Role)}
                          </div>
                          {people.map((member: Member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </div>
                      )
                  )}
                </SelectContent>
              </Select>

              {currentUser && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-300 border-green-500/30"
                  >
                    {t.welcome}, {currentUser.name}!
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentUser(null)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    ✕ {t.clear}
                  </Button>
                </div>
              )}
            </div>

            {currentUser && (
              <div className="flex flex-wrap gap-2">
                {(["A", "U", "?"] as AvailabilityState[]).map((state) => (
                  <Button
                    key={state}
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkModal({ isOpen: true, state })}
                    className={`bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm ${
                      state === "A"
                        ? "hover:border-green-500/50"
                        : state === "U"
                        ? "hover:border-red-500/50"
                        : "hover:border-gray-500/50"
                    }`}
                  >
                    <span className="hidden sm:inline">{t.bulk}</span>{" "}
                    {getAvailabilityIconOrDefault(state)}{" "}
                    <span className="hidden sm:inline">
                      {state === "A"
                        ? t.available
                        : state === "U"
                        ? t.unavailable
                        : t.uncertain}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalEvents}
              </div>
              <div className="text-white/60 text-sm">{t.upcomingEvents}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalMembers}
              </div>
              <div className="text-white/60 text-sm">{t.bandMembers}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {overallRate}%
              </div>
              <div className="text-white/60 text-sm">
                {t.overallResponseRate}
              </div>
            </div>
            {currentUser && (
              <div>
                <div className="text-2xl font-bold text-white">{userRate}%</div>
                <div className="text-white/60 text-sm">
                  {t.yourResponseRate}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes */}
      {hasUnsavedChanges && (
        <Card className="glass border-orange-500/20 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div className="text-white">
                  <div className="font-semibold text-sm sm:text-base">
                    {pendingChanges.size} {t.unsavedChanges}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70">
                    {t.unsavedChangesDescription}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardAllChanges}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {t.discardAll}
                </Button>
                <Button
                  size="sm"
                  onClick={submitAllChanges}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {t.submitAllChanges}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Undo */}
      {lastAction && (
        <Card className="glass border-blue-500/20 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">↶</span>
                <div className="text-white">
                  <div className="font-semibold text-sm sm:text-base">
                    {t.undoAvailable}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70">
                    {t.undoDescription}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={undoLastAction}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 self-start sm:self-auto text-xs sm:text-sm"
              >
                ↶ {t.undoAction}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events */}
      <div className="space-y-4">
        {events && events.length > 0 ? (
          events.map((event, index) => {
            const userAvailability = currentUser
              ? getUserAvailability(event.date, currentUser.id)
              : null;
            const needsResponse = currentUser && userAvailability === null;
            const dayAvail = availabilityByDate[event.date] || {};
            const hasResponses = Object.keys(dayAvail).length > 0;

            // Calculate coverage for this event
            const coverage = calculateEventCoverage(
              event,
              members || [],
              availabilityByDate
            );

            return (
              <Card
                key={event.id}
                className={`glass border-white/20 fade-in ${
                  needsResponse ? "border-l-4 border-l-red-500" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{event.title}</span>
                      {needsResponse && <span>⚠️</span>}
                      <Badge
                        variant="outline"
                        className={`${getCoverageStatusColor(
                          coverage.status
                        )} text-xs hidden sm:inline-flex`}
                      >
                        {getCoverageStatusIcon(coverage.status)}{" "}
                        {coverage.coverageScore}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        {formatDate(event.date)}
                      </Badge>
                    </div>
                  </CardTitle>
                  {event.description && (
                    <p className="text-white/70">{event.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Coverage Summary */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      🎼 Band Coverage
                      <Badge
                        variant="outline"
                        className={getCoverageStatusColor(coverage.status)}
                      >
                        {getCoverageStatusIcon(coverage.status)}{" "}
                        {coverage.status.replace("-", " ")}
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      {Object.entries(coverage.coverageByRole).map(
                        ([role, roleCoverage]) => (
                          <div key={role} className="text-center">
                            <div className="text-white/70 capitalize">
                              {getRoleDisplayName(role as Role)}
                            </div>
                            <div
                              className={`font-medium ${
                                roleCoverage!.available >=
                                roleCoverage!.required
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {roleCoverage!.available}/{roleCoverage!.required}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* User's availability */}
                  {currentUser && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">
                        🎯 Your Availability
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            if (!currentUser) return;
                            // Create a safe cycle function that handles the null case
                            const safeCycle = (
                              state: typeof userAvailability
                            ): AvailabilityState => {
                              if (state === null) return "A";
                              return state === "?"
                                ? "A"
                                : state === "A"
                                ? "U"
                                : "?";
                            };
                            const nextState = safeCycle(userAvailability);
                            setAvailabilityLocal(
                              event.date,
                              currentUser.id,
                              nextState
                            );
                          }}
                          className={`min-w-[140px] ${
                            userAvailability === "A"
                              ? "bg-green-600 hover:bg-green-700"
                              : userAvailability === "U"
                              ? "bg-red-600 hover:bg-red-700"
                              : userAvailability === "?"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          } text-white`}
                        >
                          {getAvailabilityIconOrDefault(userAvailability)}{" "}
                          {getAvailabilityDisplayNameOrDefault(
                            userAvailability
                          )}
                        </Button>

                        {Array.from(pendingChanges.values()).some(
                          (change) =>
                            change.date === event.date &&
                            change.personId === currentUser.id
                        ) && (
                          <Badge
                            variant="outline"
                            className="border-orange-400/50 text-orange-300"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Responses by role */}
                  {hasResponses ? (
                    <div className="space-y-4">
                      {/* Coverage optimization indicator */}
                      {coverage.status === "fully-covered" && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-300 text-sm">
                            <span>✅</span>
                            <span>
                              {t.fullyCovered} -{" "}
                              {t.availableMembers.toLowerCase()} shown only
                            </span>
                          </div>
                        </div>
                      )}

                      {Object.entries(membersByRole).map(([role, people]) => {
                        const roleResponses = people.filter(
                          (person: Member) => {
                            const state = dayAvail[person.id];
                            if (!state) return false;

                            // If event is fully covered, only show available responses
                            if (coverage.status === "fully-covered") {
                              return state === "A";
                            }

                            // Otherwise show all responses (A, U, and ?)
                            return true;
                          }
                        );

                        if (roleResponses.length === 0) return null;

                        return (
                          <div key={role} className="space-y-2">
                            <h4 className="text-white font-medium">
                              🎵 {getRoleDisplayName(role as Role)} (
                              {roleResponses.length}/
                              {coverage.status === "fully-covered"
                                ? people.filter(
                                    (p: Member) => dayAvail[p.id] === "A"
                                  ).length
                                : people.length}{" "}
                              {coverage.status === "fully-covered"
                                ? t.availableMembers.toLowerCase()
                                : "responded"}
                              )
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {roleResponses.map((person: Member) => {
                                const state = dayAvail[person.id];
                                const isCurrentUser =
                                  currentUser?.id === person.id;

                                return (
                                  <div
                                    key={person.id}
                                    className={`flex items-center justify-between p-3 rounded-lg bg-white/5 border ${
                                      isCurrentUser
                                        ? "border-blue-500/30 bg-blue-500/10"
                                        : "border-white/10"
                                    }`}
                                  >
                                    <span className="text-white">
                                      {person.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        state === "A"
                                          ? "border-green-500/50 text-green-300"
                                          : state === "U"
                                          ? "border-red-500/50 text-red-300"
                                          : "border-gray-500/50 text-gray-300"
                                      }`}
                                    >
                                      {getAvailabilityIconOrDefault(state)}{" "}
                                      {state === "A"
                                        ? "Available"
                                        : state === "U"
                                        ? "Unavailable"
                                        : "Uncertain"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <div className="text-2xl mb-2">👋</div>
                      <p>No responses yet. Be the first to respond!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="glass border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white/60">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-xl">No events scheduled yet</p>
                <p className="text-sm mt-2">Contact your admin to add events</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <BulkActionModal
        isOpen={bulkModal.isOpen}
        onClose={() => setBulkModal({ ...bulkModal, isOpen: false })}
        onApply={(dates, state) => {
          if (currentUser) {
            setBulkAvailability(dates, currentUser.id, state);
          }
        }}
        events={events || []}
        state={bulkModal.state}
      />

      <AddEventModal
        isOpen={addEventModal}
        onClose={() => setAddEventModal(false)}
        onAdd={handleAddEvent}
      />

      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              ⌨️ Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Global shortcuts available throughout the application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-white/80">
                <strong>Ctrl/⌘ + R</strong> - Refresh data
              </div>
              <div className="text-white/80">
                <strong>Ctrl/⌘ + Z</strong> - Undo last action
              </div>
              <div className="text-white/80">
                <strong>Ctrl/⌘ + S</strong> - Save changes
              </div>
              <div className="text-white/80">
                <strong>?</strong> - Show this help
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
