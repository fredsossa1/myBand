'use client';

import { useState } from 'react';
import { useAppData } from '@/lib/api-hooks';
import { groupMembersByRole, groupAvailabilityByDate } from '@/lib/utils';
import { MemberCard } from './member-card';
import { EventCard } from './event-card';
import { RoleMemberList, RoleOverview } from './role-member-list';
import { LoadingCard, LoadingState, ErrorState, EmptyState } from './loading-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ComponentShowcase() {
  const { members, events, availability, loading, error, refetch } = useAppData();
  const [selectedDate, setSelectedDate] = useState('2025-08-29');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard title="Loading Components Demo" message="Fetching band data..." />
        <LoadingState rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Failed to Load Demo"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!members || !events || !availability || !Array.isArray(members) || !Array.isArray(events) || !Array.isArray(availability)) {
    return (
      <EmptyState 
        title="No Data Available"
        message="Unable to load band data for the component demo"
        icon="🎵"
        action={{
          label: "Reload",
          onClick: refetch
        }}
      />
    );
  }

  const membersByRole = groupMembersByRole(members);
  const availabilityByDate = groupAvailabilityByDate(availability);

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            shadcn/ui Components Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">View Mode</label>
              <Select value={viewMode} onValueChange={(value: 'overview' | 'detailed') => setViewMode(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={refetch}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                🔄 Refresh
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30"
                  >
                    ℹ️ Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Component Information</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      This showcase demonstrates the shadcn/ui components integrated with your band availability system.
                      All components use glass morphism styling and are fully interactive.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {members.length} Members
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      {events.length} Events
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {availability.length} Responses
                    </Badge>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Overview */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Role Overview</h2>
        <RoleOverview 
          membersByRole={membersByRole}
          selectedDate={selectedDate}
          availabilityByDate={availabilityByDate}
        />
      </div>

      {/* Sample Event Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Event Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events?.slice(0, 3).map((event) => {
            // Calculate mock coverage stats - handle undefined availability
            const eventAvailability = availability?.filter(a => a.date === event.date) || [];
            const coverageStats = {
              totalResponses: eventAvailability.length,
              totalMembers: members?.length || 0,
              availableCount: eventAvailability.filter(a => a.state === 'A').length,
              unavailableCount: eventAvailability.filter(a => a.state === 'U').length,
              uncertainCount: eventAvailability.filter(a => a.state === '?').length,
            };

            return (
              <EventCard
                key={event.id}
                event={event}
                coverageStats={coverageStats}
                onClick={() => setSelectedDate(event.date)}
                compact={viewMode === 'overview'}
              />
            );
          })}
        </div>
      </div>

      {/* Sample Member Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Member Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members?.slice(0, 6).map((member) => {
            const memberAvailability = availabilityByDate[selectedDate]?.[member.id] || null;
            
            return (
              <MemberCard
                key={member.id}
                member={member}
                availability={memberAvailability}
                onAvailabilityChange={(state) => {
                  console.log(`Setting ${member.name} to ${state} for ${selectedDate}`);
                  // In a real app, this would call the API
                }}
                compact={viewMode === 'overview'}
              />
            );
          })}
        </div>
      </div>

      {/* Role Member List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Role-based Member List</h2>
        <RoleMemberList
          membersByRole={membersByRole}
          selectedDate={selectedDate}
          availabilityByDate={availabilityByDate}
          onAvailabilityChange={(memberId, state) => {
            console.log(`Setting member ${memberId} to ${state} for ${selectedDate}`);
            // In a real app, this would call the API
          }}
          compact={viewMode === 'overview'}
        />
      </div>

      {/* Loading States Demo */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingState rows={2} />
          <div className="space-y-4">
            <EmptyState 
              title="No Events This Week"
              message="No events are scheduled for the selected week"
              icon="📅"
              action={{
                label: "Add Event",
                onClick: () => console.log("Add event clicked")
              }}
            />
          </div>
        </div>
      </div>

      {/* Component Stats */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Component Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Object.keys(membersByRole).length}</div>
              <div className="text-white/60 text-sm">Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{members.length}</div>
              <div className="text-white/60 text-sm">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{events.length}</div>
              <div className="text-white/60 text-sm">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{availability.length}</div>
              <div className="text-white/60 text-sm">Responses</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
