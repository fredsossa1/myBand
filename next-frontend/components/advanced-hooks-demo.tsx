"use client";

import { useState } from "react";
import { useAvailability, useBandKeyboardShortcuts } from "@/hooks";
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
import { getAvailabilityIcon, getRoleDisplayName } from "@/lib/constants";

export function AdvancedHooksDemo() {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Use the advanced availability hook
  const {
    members,
    events,
    availability,
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
  const shortcuts = useBandKeyboardShortcuts({
    refresh: () => {
      console.log("🔄 Keyboard shortcut: Refresh");
      refetch();
    },
    undo: () => {
      console.log("↶ Keyboard shortcut: Undo");
      undoLastAction();
    },
    save: () => {
      if (hasUnsavedChanges) {
        console.log("💾 Keyboard shortcut: Save");
        submitAllChanges();
      }
    },
    toggleUser: () => {
      console.log("👤 Keyboard shortcut: Toggle user");
      setCurrentUser(currentUser ? null : members?.[0] || null);
    },
    openHelp: () => {
      console.log("❓ Keyboard shortcut: Help");
      setShowKeyboardHelp(true);
    },
  });

  if (loading) {
    return (
      <Card className="glass border-white/20">
        <CardContent className="p-8">
          <div className="text-center text-white">
            <div className="text-2xl mb-4">⏳</div>
            <p>Loading advanced hooks demo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-500/20">
        <CardContent className="p-8">
          <div className="text-center text-red-400">
            <div className="text-2xl mb-4">❌</div>
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            Advanced Hooks Demo - Step 2D
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white/80">
            <p>
              This demo showcases the advanced React hooks that replicate
              vanilla JavaScript functionality:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>useAvailability</strong>: Optimistic updates, pending
                changes, undo functionality
              </li>
              <li>
                <strong>useKeyboardShortcuts</strong>: Global keyboard shortcuts
                (Ctrl+R, Ctrl+Z, Ctrl+S, etc.)
              </li>
              <li>
                <strong>Batch operations</strong>: Submit/discard multiple
                changes at once
              </li>
              <li>
                <strong>Real-time state</strong>: Local state merging with
                server data
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* User Selection */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            👤 User Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={currentUser?.id || ""}
              onValueChange={(id) => {
                const user = members?.find((m) => m.id === id);
                setCurrentUser(user || null);
              }}
            >
              <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select your name..." />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({getRoleDisplayName(member.role)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentUser && (
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-300 border-green-500/30"
              >
                Current: {currentUser.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes Indicator */}
      {hasUnsavedChanges && (
        <Card className="glass border-orange-500/20 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div className="text-white">
                  <div className="font-semibold">
                    {pendingChanges.size} unsaved change
                    {pendingChanges.size !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-white/70">
                    Changes are saved locally until you submit them
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardAllChanges}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={submitAllChanges}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Undo Indicator */}
      {lastAction && (
        <Card className="glass border-blue-500/20 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">↶</span>
                <div className="text-white">
                  <div className="font-semibold">Undo Available</div>
                  <div className="text-sm text-white/70">
                    Last action can be undone (Ctrl+Z)
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={undoLastAction}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ↶ Undo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events with Availability Controls */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            📅 Availability Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-4">
              {events?.slice(0, 3).map((event) => {
                const userAvailability =
                  getUserAvailability(event.date, currentUser.id) || "?";
                const isPending = Array.from(pendingChanges.values()).some(
                  (change) =>
                    change.eventId.toString() === event.id.toString() &&
                    change.personId === currentUser.id
                );

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {event.title}
                      </div>
                      <div className="text-white/60 text-sm">{event.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Badge
                          variant="outline"
                          className="border-orange-400/50 text-orange-300"
                        >
                          Pending
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const nextState = cycle(userAvailability);
                          setAvailabilityLocal(
                            event.date,
                            currentUser.id,
                            nextState
                          );
                        }}
                        className={`
                          border-white/20 text-white min-w-[120px]
                          ${
                            userAvailability === "A"
                              ? "bg-green-500/20 border-green-500/30"
                              : ""
                          }
                          ${
                            userAvailability === "U"
                              ? "bg-red-500/20 border-red-500/30"
                              : ""
                          }
                          ${
                            userAvailability === "?"
                              ? "bg-gray-500/20 border-gray-500/30"
                              : ""
                          }
                        `}
                      >
                        {getAvailabilityIcon(userAvailability)}{" "}
                        {userAvailability === "A"
                          ? "Available"
                          : userAvailability === "U"
                          ? "Unavailable"
                          : "Uncertain"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setAvailabilityRemote(
                            event.date,
                            currentUser.id,
                            cycle(userAvailability)
                          )
                        }
                        className="text-white/60 hover:text-white hover:bg-white/10"
                        title="Save immediately (bypass local state)"
                      >
                        💾
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              <div className="text-2xl mb-4">👤</div>
              <p>Select a user above to manage availability</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center justify-between">
            ⌨️ Keyboard Shortcuts
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  Show All
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Keyboard Shortcuts
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    Global shortcuts available throughout the application
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {shortcuts.getShortcuts().map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded bg-white/5"
                    >
                      <span className="text-white font-mono text-sm">
                        {shortcut.ctrlKey || shortcut.metaKey
                          ? "⌘/Ctrl + "
                          : ""}
                        {shortcut.shiftKey ? "Shift + " : ""}
                        {shortcut.altKey ? "Alt + " : ""}
                        {shortcut.key.toUpperCase()}
                      </span>
                      <span className="text-white/70 text-sm">
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <strong>?</strong> - Show keyboard help
            </div>
          </div>
          <div className="mt-4 text-white/60 text-sm">
            <p>
              💡 Shortcuts are automatically disabled when typing in form fields
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            🔍 Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-white/60">Pending Changes</div>
              <div className="text-white font-mono">{pendingChanges.size}</div>
            </div>
            <div>
              <div className="text-white/60">Shortcuts Enabled</div>
              <div className="text-white font-mono">
                {shortcuts.isEnabled ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <div className="text-white/60">Current User</div>
              <div className="text-white font-mono">
                {currentUser?.name || "None"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
