"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAvailability } from "@/hooks/use-availability";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import {
  getRoleDisplayName,
  getAvailabilityIconOrDefault,
  getAvailabilityDisplayNameOrDefault,
} from "@/lib/constants";
import { Member, Role, AvailabilityState } from "@/lib/types";

import {
  Users,
  RefreshCw,
  HelpCircle,
  Shield,
  ShieldCheck,
  Lock,
  Calendar,
  CalendarPlus,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Music,
  Guitar,
  Keyboard,
  Drum,
  Mic,
  UserIcon,
} from "lucide-react";

export default function AvailabilityPage() {
  const [bulkModal, setBulkModal] = useState<{
    isOpen: boolean;
    state: AvailabilityState;
  }>({
    isOpen: false,
    state: "A",
  });
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [addEventModal, setAddEventModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
    submitAllChanges,
    discardAllChanges,
    undoLastAction,
    lastAction,
    refetch,
    getUserAvailability,
    setBulkAvailability,
  } = useAvailability();

  // Admin functions
  const handleAdminLogin = () => {
    if (adminPassword === "worship2024") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword("");
      localStorage.setItem("adminSession", "worship2024");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("adminSession");
  };

  const handleAddEvent = async (eventData: any) => {
    // Add event logic here
    setAddEventModal(false);
    refetch();
  };

  // Check for existing admin session
  useEffect(() => {
    const savedAdminSession = localStorage.getItem("adminSession");
    if (savedAdminSession === "worship2024") {
      setIsAdmin(true);
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: refetch,
    onUndo: undoLastAction,
    onSave: submitAllChanges,
    onHelp: () => setShowKeyboardHelp(true),
  });

  // Group members by role
  const membersByRole =
    members?.reduce((acc, member) => {
      if (!acc[member.role]) acc[member.role] = [];
      acc[member.role].push(member);
      return acc;
    }, {} as Record<string, Member[]>) || {};

  // Calculate statistics
  const stats = {
    totalMembers: members?.length || 0,
    totalEvents: events?.length || 0,
    totalResponses: Object.values(availabilityByDate || {})
      .flat()
      .filter((a) => a.state !== "?").length,
    userResponses: currentUser
      ? Object.values(availabilityByDate || {})
          .flat()
          .filter((a) => a.personId === currentUser.id && a.state !== "?")
          .length
      : 0,
  };

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="space-y-6 w-full max-w-lg text-center">
          <div className="space-y-3">
            <div className="mx-auto h-16 w-16 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse bg-white/5">
              <Zap className="h-8 w-8 text-white/70" />
            </div>
            <h2 className="text-white text-2xl font-semibold tracking-tight">
              Loading band data
            </h2>
            <p className="text-white/60 text-sm">
              Fetching members, events, and availability...
            </p>
          </div>
          <Progress value={65} className="h-2" />
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
                <p className="text-xl">Error loading data: {error}</p>
                <Button onClick={refetch} className="mt-4" variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
              <span className="inline-flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur border border-white/20">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-fuchsia-300" />
              </span>
              <span className="bg-gradient-to-r from-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                Band Availability
              </span>
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Plan services, track responses, and keep every role covered.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboardHelp(true)}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <HelpCircle className="h-4 w-4" /> Shortcuts
            </Button>
          </div>
        </div>

        {/* Admin Section */}
        <Card className="glass border-white/20">
          <CardContent className="p-4">
            {!isAdmin ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-cyan-300" />
                  <div className="text-white">
                    <div className="font-medium text-sm">Admin Access</div>
                    <div className="text-xs text-white/60">
                      Login to manage events
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {showAdminLogin ? (
                    <>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAdminLogin()
                        }
                        className="w-32 h-8 bg-white/10 border-white/20 text-white text-sm"
                      />
                      <Button
                        onClick={handleAdminLogin}
                        disabled={!adminPassword}
                        className="h-8 px-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
                      >
                        Login
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowAdminLogin(false)}
                        className="h-8 px-2 text-white/60 hover:text-white text-sm"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAdminLogin(true)}
                      className="h-8 gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
                    >
                      <Shield className="h-3 w-3" /> Login
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 gap-1 text-xs">
                    <Shield className="h-3 w-3" /> Admin Active
                  </Badge>
                  <div className="text-white/70 text-xs">
                    Manage events and view stats
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAddEventModal(true)}
                    className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                  >
                    <CalendarPlus className="h-3 w-3" /> Add Event
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleAdminLogout}
                    className="h-8 px-2 text-white/60 hover:text-white text-sm"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Selection & Stats in Row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* User Selection */}
          <Card className="glass border-white/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-white/60" />
                  <span className="text-sm font-medium text-white">
                    Select Your Name
                  </span>
                </div>
                <Select
                  value={currentUser?.id || ""}
                  onValueChange={(id) => {
                    const user = members?.find((m) => m.id === id);
                    setCurrentUser(user || null);
                  }}
                >
                  <SelectTrigger className="w-full bg-white/10 border-white/20 text-white h-10">
                    <SelectValue placeholder="Choose your name..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {Object.entries(membersByRole).map(
                      ([role, people]) =>
                        people.length > 0 && (
                          <div key={role}>
                            <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase">
                              {getRoleDisplayName(role as Role)}
                            </div>
                            {people.map((member: Member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                                className="text-white"
                              >
                                {member.name}
                              </SelectItem>
                            ))}
                          </div>
                        )
                    )}
                  </SelectContent>
                </Select>

                {currentUser && (
                  <div className="flex items-center justify-between p-2 rounded bg-white/5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                      >
                        {currentUser.name}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {getRoleDisplayName(currentUser.role as Role)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentUser(null)}
                      className="h-6 px-2 text-white/60 hover:text-white"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card className="glass border-white/20 md:col-span-2">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-white/60" />
                  <span className="text-sm font-medium text-white">
                    Team Engagement
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">
                        Overall Response Rate
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          overallRate >= 80
                            ? "border-emerald-500/50 text-emerald-300"
                            : overallRate >= 60
                            ? "border-amber-500/50 text-amber-300"
                            : "border-red-500/50 text-red-300"
                        }`}
                      >
                        {overallRate}%
                      </Badge>
                    </div>
                    <Progress
                      value={overallRate}
                      className="h-2"
                      indicatorClassName={
                        overallRate >= 80
                          ? "bg-emerald-500"
                          : overallRate >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    />
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{stats.totalEvents} Events</span>
                      <span>{stats.totalMembers} Members</span>
                      <span>{stats.totalResponses} Responses</span>
                    </div>
                  </div>

                  {currentUser && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60">
                          Your Response Rate
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            userRate >= 90
                              ? "border-emerald-500/50 text-emerald-300"
                              : userRate >= 70
                              ? "border-amber-500/50 text-amber-300"
                              : "border-red-500/50 text-red-300"
                          }`}
                        >
                          {userRate}%
                        </Badge>
                      </div>
                      <Progress
                        value={userRate}
                        className="h-2"
                        indicatorClassName={
                          userRate >= 90
                            ? "bg-emerald-500"
                            : userRate >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      />
                      <div className="text-xs text-white/50">
                        {userRate >= 90
                          ? "🎉 Excellent!"
                          : userRate >= 70
                          ? "👍 Good job"
                          : userRate >= 50
                          ? "📈 Keep improving"
                          : "💬 Please respond more"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Changes */}
        {hasUnsavedChanges && (
          <Card className="glass border-orange-500/20 bg-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-300" />
                  <div className="text-white">
                    <div className="font-medium text-sm">
                      {pendingChanges.size} unsaved change
                      {pendingChanges.size !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-white/70">
                      Changes are saved locally - submit to save to server
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={discardAllChanges}
                    className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Discard All
                  </Button>
                  <Button
                    size="sm"
                    onClick={submitAllChanges}
                    className="h-8 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Submit Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map((event) => {
              const dayAvail = availabilityByDate?.[event.date] || {};
              const userAvailability = currentUser
                ? getUserAvailability(event.date, currentUser.id)
                : null;
              const hasResponses = Object.keys(dayAvail).length > 0;

              return (
                <Card key={event.id} className="glass border-white/20">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Event Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-cyan-300" />
                            {event.title}
                          </h3>
                          <div className="text-sm text-white/60">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {event.service_type || "Service"}
                        </Badge>
                      </div>

                      {/* Your Availability */}
                      {currentUser && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-cyan-300" /> Your
                            Availability
                          </h4>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                if (!currentUser) return;
                                const nextState =
                                  userAvailability === "A"
                                    ? "U"
                                    : userAvailability === "U"
                                    ? "?"
                                    : "A";
                                setAvailabilityLocal(
                                  event.date,
                                  currentUser.id,
                                  nextState
                                );
                              }}
                              className={`min-w-[140px] h-10 ${
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

                      {/* Team Responses */}
                      {hasResponses && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Users className="h-4 w-4 text-cyan-300" /> Team
                            Responses
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(membersByRole).map(
                              ([role, people]) => {
                                const roleResponses = people.filter(
                                  (person: Member) => {
                                    const state = dayAvail[person.id]?.state;
                                    return state && state !== "?";
                                  }
                                );

                                if (roleResponses.length === 0) return null;

                                return (
                                  <div key={role} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      {role === "bassist" && (
                                        <Guitar className="h-4 w-4 text-purple-300" />
                                      )}
                                      {role === "pianist" && (
                                        <Keyboard className="h-4 w-4 text-blue-300" />
                                      )}
                                      {role === "drummer" && (
                                        <Drum className="h-4 w-4 text-orange-300" />
                                      )}
                                      {(role === "lead" ||
                                        role === "background") && (
                                        <Mic className="h-4 w-4 text-pink-300" />
                                      )}
                                      <span className="text-sm text-white font-medium">
                                        {getRoleDisplayName(role as Role)}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-white/5 border-white/20 text-white/60"
                                      >
                                        {roleResponses.length}/{people.length}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {roleResponses.map((person: Member) => {
                                        const state =
                                          dayAvail[person.id]?.state;
                                        const isCurrentUser =
                                          currentUser?.id === person.id;

                                        return (
                                          <div
                                            key={person.id}
                                            className={`flex items-center justify-between p-2 rounded border transition-all ${
                                              isCurrentUser
                                                ? "border-cyan-500/40 bg-cyan-500/10"
                                                : "border-white/10 bg-white/5"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Avatar
                                                fallback={person.name.charAt(0)}
                                                className="h-6 w-6 bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs"
                                              />
                                              <span className="text-white text-sm">
                                                {person.name}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className={`text-xs ${
                                                state === "A"
                                                  ? "border-emerald-500/50 text-emerald-300"
                                                  : state === "U"
                                                  ? "border-red-500/50 text-red-300"
                                                  : "border-amber-500/50 text-amber-300"
                                              }`}
                                            >
                                              {getAvailabilityIconOrDefault(
                                                state
                                              )}
                                            </Badge>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                  <p className="text-sm mt-2">
                    Contact your admin to add events
                  </p>
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
    </div>
  );
}
