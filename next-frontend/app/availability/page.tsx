"use client";

import { useState, useEffect } from "react";
import { useAvailability, useBandKeyboardShortcuts } from "@/hooks";
import { useTranslations, useLanguage } from "@/hooks/use-language";
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
  getRoleDisplayNameTranslated,
  formatDate,
} from "@/lib/constants";
import {
  groupMembersByRole,
  calculateEventCoverage,
  getCoverageStatusIcon,
  getCoverageStatusColor,
  formatEventType,
} from "@/lib/utils";
import { Role, AvailabilityState, Member, EventType, Event as BandEvent } from "@/lib/types";
import { StatsService } from "@/lib/stats-service";

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
  const { language } = useLanguage();

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

  // Calculate stats for events using the centralized service
  // Separate today's events from upcoming events
  const todaysEvents =
    events?.filter((event) => {
      const [year, month, day] = event.date.split("-").map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Get current date in Montreal EST timezone
      const now = new Date();
      const montrealTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Montreal"}));
      
      return eventDate.toDateString() === montrealTime.toDateString();
    }) || [];

  const upcomingEvents =
    events?.filter((event) => {
      const [year, month, day] = event.date.split("-").map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Get current date in Montreal EST timezone
      const now = new Date();
      const montrealTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Montreal"}));
      montrealTime.setHours(23, 59, 59, 999);
      
      return eventDate > montrealTime;
    }) || [];

  // Combine today's and upcoming events for stats calculation
  const allRelevantEvents = [...todaysEvents, ...upcomingEvents];

  // Use the centralized stats service
  const overallStats = StatsService.calculateOverallStats(
    members || [],
    allRelevantEvents,
    // Convert availabilityByDate to AvailabilityRecord array
    Object.entries(availabilityByDate).flatMap(([date, dayAvail]) => 
      Object.entries(dayAvail).map(([personId, state]) => ({
        person_id: personId,
        date: date,
        state,
        created_at: new Date().toISOString()
      }))
    )
  );

  const userStats = currentUser ? StatsService.calculateMemberStats(
    currentUser,
    allRelevantEvents,
    Object.entries(availabilityByDate).flatMap(([date, dayAvail]) => 
      Object.entries(dayAvail).map(([personId, state]) => ({
        person_id: personId,
        date: date,
        state,
        created_at: new Date().toISOString()
      }))
    )
  ) : null;

  const overallRate = overallStats.overallResponseRate;
  const userRate = userStats?.responseRate || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 p-4">
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
    <div className={`space-y-6 ${hasUnsavedChanges ? "pb-32" : ""}`}>
      {/* Header */}
      <Card className="glass border-white/20">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Title Section */}
            <div className="text-center sm:text-left">
              <CardTitle className="text-white text-xl sm:text-2xl flex items-center justify-center sm:justify-start gap-3">
                <span className="text-2xl sm:text-3xl">🎵</span>
                {t.appTitle}
              </CardTitle>
              <p className="text-white/70 mt-2 text-sm sm:text-base">
                {t.appSubtitle}
              </p>
            </div>

            {/* Button Section */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                size="default"
                onClick={refetch}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                🔄 {t.refresh}
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowKeyboardHelp(true)}
                className="hidden sm:flex bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ⌨️ {t.keyboardShortcuts}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin Add Event Button - Desktop */}
      {isAdmin && (
        <Card className="glass border-green-500/30 hidden sm:block">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white">
                <div className="font-semibold text-green-300 text-base">
                  🔑 {t.adminControls}
                </div>
                <div className="text-sm text-white/70">
                  {t.adminManageDescription}
                </div>
              </div>
              <Button
                onClick={() => setAddEventModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                📅 {t.addEvent}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Add Event Button - Mobile FAB */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Button
            onClick={() => setAddEventModal(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white border-2 border-white/20"
            size="sm"
          >
            <span className="text-2xl">📅</span>
          </Button>
        </div>
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
                <SelectTrigger className="w-full sm:w-64 bg-white/30 border-white/40 text-white [&>span]:text-white [&>span]:opacity-100">
                  <SelectValue placeholder={t.selectName} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(membersByRole).map(
                    ([role, people]) =>
                      people.length > 0 && (
                        <div key={role}>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase">
                            {getRoleDisplayNameTranslated(role as Role, t)}
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {allRelevantEvents.length}
              </div>
              <div className="text-white/60 text-sm">Today & Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {overallStats.totalMembers}
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

      {/* Pending Changes - Sticky Bottom Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <Card className="glass border-orange-500/20 bg-orange-500/20 backdrop-blur-xl max-w-4xl mx-auto">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div className="text-white">
                    <div className="font-semibold text-sm sm:text-base">
                      {pendingChanges.size} {t.unsavedChanges}
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
        </div>
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
      <div className="space-y-6">
        {/* Today's Events */}
        {todaysEvents && todaysEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">🎯 Today's Events</h2>
              <Badge variant="outline" className="border-orange-400/50 text-orange-300">
                {todaysEvents.length} event{todaysEvents.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {todaysEvents.map((event, index) => {
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
                  className={`glass border-orange-400/30 bg-orange-500/5 fade-in ${
                    needsResponse ? "border-l-4 border-l-red-500" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-orange-400">🎯</span>
                        <span className="truncate">{event.title}</span>
                        {needsResponse && (
                          <span className="flex-shrink-0">⚠️</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={`${getCoverageStatusColor(
                            coverage.status
                          )} text-xs flex-shrink-0`}
                        >
                          {getCoverageStatusIcon(coverage.status)}{" "}
                          {coverage.coverageScore}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-blue-500/30 text-blue-300 text-xs flex-shrink-0"
                        >
                          {formatEventType(event.type)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-orange-400/30 text-orange-300 whitespace-nowrap flex-shrink-0 text-xs"
                        >
                          TODAY - {formatDate(event.date)}
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
                        {isAdmin ? (
                          <>
                            🎼 Band Coverage
                            <Badge
                              variant="outline"
                              className={getCoverageStatusColor(coverage.status)}
                            >
                              {getCoverageStatusIcon(coverage.status)}{" "}
                              {coverage.status.replace("-", " ")}
                            </Badge>
                          </>
                        ) : (
                          <>🎼 Band Needs</>
                        )}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                        {Object.entries(coverage.coverageByRole)
                          .filter(([role, roleCoverage]) => {
                            // For non-admin users, hide violinist roles with 0 requirements
                            if (!isAdmin && role === "violinist" && roleCoverage!.required === 0) {
                              return false;
                            }
                            return true;
                          })
                          .map(([role, roleCoverage]) => (
                            <div key={role} className="text-center">
                              <div className="text-white/70 capitalize flex items-center justify-center gap-1">
                                {getRoleDisplayNameTranslated(role as Role, t)}
                                {role === "violinist" && (
                                  <span
                                    className="text-xs text-blue-400"
                                    title="Optional - Special Guest"
                                  >
                                    ✨
                                  </span>
                                )}
                              </div>
                              <div
                                className={`font-medium ${
                                  isAdmin ? (
                                    role === "violinist"
                                      ? roleCoverage!.available > 0
                                        ? "text-blue-400"
                                        : "text-yellow-500"
                                      : roleCoverage!.available >=
                                        roleCoverage!.required
                                      ? "text-green-400"
                                      : "text-red-400"
                                  ) : (
                                    "text-blue-400"
                                  )
                                }`}
                              >
                                {isAdmin ? (
                                  role === "violinist" ? (
                                    // Special display for violinist
                                    roleCoverage!.available > 0 ? (
                                      <span className="flex items-center justify-center gap-1">
                                        ✨ <span className="text-xs">Guest</span>
                                      </span>
                                    ) : (
                                      <span className="text-yellow-500">0/1</span>
                                    )
                                  ) : event.type === "jam-session" ? (
                                    // For jam sessions, show available count with a "+" if it exceeds minimum
                                    roleCoverage!.available >=
                                    roleCoverage!.required ? (
                                      roleCoverage!.available >
                                      roleCoverage!.required ? (
                                        <>
                                          {roleCoverage!.required}
                                          <span className="text-blue-400">
                                            +
                                            {roleCoverage!.available -
                                              roleCoverage!.required}
                                          </span>
                                        </>
                                      ) : (
                                        `${roleCoverage!.available}✓`
                                      )
                                    ) : (
                                      `${roleCoverage!.available}/${
                                        roleCoverage!.required
                                      }`
                                    )
                                  ) : (
                                    // For other events, show standard format
                                    `${roleCoverage!.available}/${
                                      roleCoverage!.required
                                    }`
                                  )
                                ) : (
                                  // Non-admin view: show only requirements
                                  role === "violinist" && roleCoverage!.required === 0 ? (
                                    null
                                  ) : (
                                    roleCoverage!.required
                                  )
                                )}
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
                        {coverage.status === "fully-covered" &&
                          event.type === "jam-session" && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-blue-300 text-sm">
                                <span>🎵</span>
                                <span>
                                  {t.fullyCovered} - {t.jamSessionEncouragement}
                                </span>
                              </div>
                            </div>
                          )}
                        {coverage.status === "fully-covered" &&
                          event.type !== "jam-session" && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-300 text-sm">
                                <span>✅</span>
                                <span>
                                  {t.fullyCovered} -{" "}
                                  {t.availableMembers.toLowerCase()}
                                </span>
                              </div>
                            </div>
                          )}

                        {/* Special indicator when violinist is available */}
                        {coverage.coverageByRole.violinist &&
                          coverage.coverageByRole.violinist.available > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-blue-300 text-sm">
                                <span>✨</span>
                                <span>
                                  {t.specialGuestPerformance} -{" "}
                                  {
                                    coverage.coverageByRole.violinist?.members.find(
                                      (m) => m.state === "A"
                                    )?.name
                                  }{" "}
                                  {t.willJoinOnViolin}
                                </span>
                              </div>
                            </div>
                          )}

                      {/* Privacy notice for non-admin users */}
                      {!isAdmin && currentUser && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-3 text-blue-300 text-sm">
                            <span className="text-lg">🔒</span>
                            <div>
                              <div className="font-medium mb-1">{t.privacyModeActive}</div>
                              <div>{t.privacyModeDescription}</div>
                            </div>
                          </div>
                        </div>
                      )}

                        {Object.entries(membersByRole).map(([role, people]) => {
                          const roleResponses = people.filter(
                            (person: Member) => {
                              const state = dayAvail[person.id];
                              if (!state) return false;

                              // Privacy filter: non-admin users only see their own responses
                              // If no user is selected, don't show any responses to non-admin users
                              if (!isAdmin) {
                                if (!currentUser) return false; // No user selected - show nothing
                                if (person.id !== currentUser.id) return false; // Different user - hide
                              }

                              // For jam sessions, always show all responses to encourage participation (if user has permission)
                              if (event.type === "jam-session") {
                                return true;
                              }

                              // For other events, if fully covered, only show available responses (if user has permission)
                              if (coverage.status === "fully-covered") {
                                return state === "A";
                              }

                              // Otherwise show all responses (A, U, and ?) (if user has permission)
                              return true;
                            }
                          );

                          if (roleResponses.length === 0) return null;

                          return (
                            <div key={role} className="space-y-2">
                              <h4 className="text-white font-medium">
                                🎵 {getRoleDisplayNameTranslated(role as Role, t)}{" "}
                                ({roleResponses.length}
                                {!isAdmin && currentUser && roleResponses.length > 0 ? " (your response)" : 
                                 !isAdmin ? "/?" : 
                                 event.type === "jam-session"
                                  ? `/${people.length} responded`
                                  : coverage.status === "fully-covered"
                                  ? `/${people.filter((p: Member) => dayAvail[p.id] === "A").length} ${t.availableMembers.toLowerCase()}`
                                  : `/${people.length} responded`})
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 auto-rows-fr">
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
                        {!isAdmin && !currentUser ? (
                          <div className="space-y-2">
                            <p>🔒 {t.selectMemberToViewResponses}</p>
                            <p className="text-sm">{t.privacyProtectionMessage}</p>
                          </div>
                        ) : (
                          <p>{t.noResponsesYet}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">📅 Upcoming Events</h2>
              <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {upcomingEvents.map((event, index) => {
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
                  <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="truncate">{event.title}</span>
                      {needsResponse && (
                        <span className="flex-shrink-0">⚠️</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`${getCoverageStatusColor(
                          coverage.status
                        )} text-xs flex-shrink-0`}
                      >
                        {getCoverageStatusIcon(coverage.status)}{" "}
                        {coverage.coverageScore}%
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 text-xs flex-shrink-0"
                      >
                        {formatEventType(event.type)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white whitespace-nowrap flex-shrink-0 text-xs"
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
                      {isAdmin ? (
                        <>
                          🎼 Band Coverage
                          <Badge
                            variant="outline"
                            className={getCoverageStatusColor(coverage.status)}
                          >
                            {getCoverageStatusIcon(coverage.status)}{" "}
                            {coverage.status.replace("-", " ")}
                          </Badge>
                        </>
                      ) : (
                        <>🎼 Band Needs</>
                      )}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                      {Object.entries(coverage.coverageByRole)
                        .filter(([role, roleCoverage]) => {
                          // For non-admin users, hide violinist roles with 0 requirements
                          if (!isAdmin && role === "violinist" && roleCoverage!.required === 0) {
                            return false;
                          }
                          return true;
                        })
                        .map(([role, roleCoverage]) => (
                          <div key={role} className="text-center">
                            <div className="text-white/70 capitalize flex items-center justify-center gap-1">
                              {getRoleDisplayNameTranslated(role as Role, t)}
                              {role === "violinist" && (
                                <span
                                  className="text-xs text-blue-400"
                                  title="Optional - Special Guest"
                                >
                                  ✨
                                </span>
                              )}
                            </div>
                            <div
                              className={`font-medium ${
                                isAdmin ? (
                                  role === "violinist"
                                    ? roleCoverage!.available > 0
                                      ? "text-blue-400"
                                      : "text-yellow-500"
                                    : roleCoverage!.available >=
                                      roleCoverage!.required
                                    ? "text-green-400"
                                    : "text-red-400"
                                ) : (
                                  "text-blue-400"
                                )
                              }`}
                            >
                              {isAdmin ? (
                                role === "violinist" ? (
                                  // Special display for violinist
                                  roleCoverage!.available > 0 ? (
                                    <span className="flex items-center justify-center gap-1">
                                      ✨ <span className="text-xs">Guest</span>
                                    </span>
                                  ) : (
                                    <span className="text-yellow-500">0/1</span>
                                  )
                                ) : event.type === "jam-session" ? (
                                  // For jam sessions, show available count with a "+" if it exceeds minimum
                                  roleCoverage!.available >=
                                  roleCoverage!.required ? (
                                    roleCoverage!.available >
                                    roleCoverage!.required ? (
                                      <>
                                        {roleCoverage!.required}
                                        <span className="text-blue-400">
                                          +
                                          {roleCoverage!.available -
                                            roleCoverage!.required}
                                        </span>
                                      </>
                                    ) : (
                                      `${roleCoverage!.available}✓`
                                    )
                                  ) : (
                                    `${roleCoverage!.available}/${
                                      roleCoverage!.required
                                    }`
                                  )
                                ) : (
                                  // For other events, show standard format
                                  `${roleCoverage!.available}/${
                                    roleCoverage!.required
                                  }`
                                )
                              ) : (
                                // Non-admin view: show only requirements
                                role === "violinist" && roleCoverage!.required === 0 ? (
                                  null
                                ) : (
                                  roleCoverage!.required
                                )
                              )}
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
                      {coverage.status === "fully-covered" &&
                        event.type === "jam-session" && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-blue-300 text-sm">
                              <span>🎵</span>
                              <span>
                                {t.fullyCovered} - {t.jamSessionEncouragement}
                              </span>
                            </div>
                          </div>
                        )}
                      {coverage.status === "fully-covered" &&
                        event.type !== "jam-session" && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-300 text-sm">
                              <span>✅</span>
                              <span>
                                {t.fullyCovered} -{" "}
                                {t.availableMembers.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Special indicator when violinist is available */}
                      {coverage.coverageByRole.violinist &&
                        coverage.coverageByRole.violinist.available > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-blue-300 text-sm">
                              <span>✨</span>
                              <span>
                                {t.specialGuestPerformance} -{" "}
                                {
                                  coverage.coverageByRole.violinist?.members.find(
                                    (m) => m.state === "A"
                                  )?.name
                                }{" "}
                                {t.willJoinOnViolin}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Privacy notice for non-admin users */}
                      {!isAdmin && currentUser && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-3 text-blue-300 text-sm">
                            <span className="text-lg">🔒</span>
                            <div>
                              <div className="font-medium mb-1">{t.privacyModeActive}</div>
                              <div>{t.privacyModeDescription}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {Object.entries(membersByRole).map(([role, people]) => {
                        const roleResponses = people.filter(
                          (person: Member) => {
                            const state = dayAvail[person.id];
                            if (!state) return false;

                            // Privacy filter: non-admin users only see their own responses
                            // If no user is selected, don't show any responses to non-admin users
                            if (!isAdmin) {
                              if (!currentUser) return false; // No user selected - show nothing
                              if (person.id !== currentUser.id) return false; // Different user - hide
                            }

                            // For jam sessions, always show all responses to encourage participation (if user has permission)
                            if (event.type === "jam-session") {
                              return true;
                            }

                            // For other events, if fully covered, only show available responses (if user has permission)
                            if (coverage.status === "fully-covered") {
                              return state === "A";
                            }

                            // Otherwise show all responses (A, U, and ?) (if user has permission)
                            return true;
                          }
                        );

                        if (roleResponses.length === 0) return null;

                        return (
                          <div key={role} className="space-y-2">
                            <h4 className="text-white font-medium">
                              🎵 {getRoleDisplayNameTranslated(role as Role, t)}{" "}
                              ({roleResponses.length}
                              {!isAdmin && currentUser && roleResponses.length > 0 ? " (your response)" : 
                               !isAdmin ? "/?" : 
                               event.type === "jam-session"
                                ? `/${people.length} responded`
                                : coverage.status === "fully-covered"
                                ? `/${people.filter((p: Member) => dayAvail[p.id] === "A").length} ${t.availableMembers.toLowerCase()}`
                                : `/${people.length} responded`})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 auto-rows-fr">
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
                      {!isAdmin && !currentUser ? (
                        <div className="space-y-2">
                          <p>🔒 {t.selectMemberToViewResponses}</p>
                          <p className="text-sm">{t.privacyProtectionMessage}</p>
                        </div>
                      ) : (
                        <p>{t.noResponsesYet}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* No events message */}
        {(!todaysEvents || todaysEvents.length === 0) && (!upcomingEvents || upcomingEvents.length === 0) && (
          <Card className="glass border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white/60">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-xl">
                  {language === "fr"
                    ? "Aucun événement à venir"
                    : "No upcoming events"}
                </p>
                <p className="text-sm mt-2">
                  {language === "fr"
                    ? "Contactez votre admin pour ajouter des événements"
                    : "Contact your admin to add events"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
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
