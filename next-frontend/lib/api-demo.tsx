// Example component demonstrating API usage
"use client";

import { useState } from "react";
import {
  useMembers,
  useEvents,
  useAvailability,
  useSetAvailability,
  useAppData,
  useApiHealth,
  useCsvExport,
} from "./api-hooks";
import BandApi from "./api";
import {
  formatDate,
  getRoleDisplayName,
  getAvailabilityIcon,
} from "./constants";

export function ApiDemo() {
  const [selectedDate, setSelectedDate] = useState("2025-08-29");
  const [selectedMember, setSelectedMember] = useState("bass1");
  const [selectedState, setSelectedState] = useState<"A" | "U" | "?">("A");

  // Using individual hooks
  const {
    data: members,
    loading: membersLoading,
    error: membersError,
  } = useMembers();
  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
  } = useEvents();

  // Using combined hook
  const {
    members: appMembers,
    events: appEvents,
    availability: appAvailability,
    loading: appLoading,
    error: appError,
    refetch: refetchAll,
  } = useAppData();

  // Using mutation hooks
  const { mutate: setAvailability, loading: settingAvailability } =
    useSetAvailability();

  // Using export hooks
  const { exportCsv, exporting } = useCsvExport();

  // API health monitoring
  const { isHealthy, lastCheck } = useApiHealth();

  const handleSetAvailability = async () => {
    try {
      await setAvailability(selectedDate, selectedMember, selectedState);
      await refetchAll(); // Refresh data after update
      alert("Availability updated successfully!");
    } catch (error) {
      alert("Failed to update availability");
    }
  };

  const handleDirectApiCall = async () => {
    try {
      const members = await BandApi.getMembers();
      console.log("Direct API call result:", members);
      alert(`Found ${members.length} members via direct API call`);
    } catch (error) {
      console.error("Direct API call failed:", error);
      alert("Direct API call failed");
    }
  };

  if (appLoading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="text-center text-white">
          <div className="text-2xl mb-2">🔄</div>
          <p>Loading band data...</p>
        </div>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="text-center text-red-300">
          <div className="text-2xl mb-2">❌</div>
          <p>Error loading data: {appError}</p>
          <button
            onClick={refetchAll}
            className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Health Status */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">🔧 API Status</h3>
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-3 h-3 rounded-full ${
              isHealthy ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-white/80">
            {isHealthy ? "Connected" : "Disconnected"}
          </span>
          {lastCheck && (
            <span className="text-white/60">
              (checked {lastCheck.toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>

      {/* Data Summary */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">📊 Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-2xl text-blue-400 font-bold">
              {appMembers?.length || 0}
            </div>
            <div className="text-white/80 text-sm">Members</div>
          </div>
          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-2xl text-green-400 font-bold">
              {appEvents?.length || 0}
            </div>
            <div className="text-white/80 text-sm">Events</div>
          </div>
          <div className="glass-dark rounded-lg p-4 text-center">
            <div className="text-2xl text-purple-400 font-bold">
              {appAvailability?.length || 0}
            </div>
            <div className="text-white/80 text-sm">Responses</div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">👥 Members</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {appMembers?.map((member) => (
            <div key={member.id} className="flex items-center gap-3 text-sm">
              <span className="text-white">{member.name}</span>
              <span className="text-white/60">
                ({getRoleDisplayName(member.role)})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">📅 Upcoming Events</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {appEvents?.map((event) => (
            <div key={event.id} className="flex items-center gap-3 text-sm">
              <span className="text-white/60">{formatDate(event.date)}</span>
              <span className="text-white">{event.title}</span>
              <span className="text-white/60">({event.type})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Setter */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">✅ Set Availability</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {appMembers?.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                    className="bg-gray-800"
                  >
                    {member.name} ({getRoleDisplayName(member.role)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Status</label>
              <select
                value={selectedState}
                onChange={(e) =>
                  setSelectedState(e.target.value as "A" | "U" | "?")
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="A" className="bg-gray-800">
                  ✅ Available
                </option>
                <option value="U" className="bg-gray-800">
                  ❌ Unavailable
                </option>
                <option value="?" className="bg-gray-800">
                  ❓ Uncertain
                </option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSetAvailability}
            disabled={settingAvailability}
            className="px-6 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            {settingAvailability ? "Setting..." : "Set Availability"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">🛠️ Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refetchAll}
            className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={handleDirectApiCall}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors"
          >
            🎯 Direct API Call
          </button>
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-lg text-orange-300 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
          >
            {exporting ? "📥 Exporting..." : "📥 Export CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
