import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getAvailabilityByRole, getMembersByRole } from '@/lib/db';

export async function GET() {
  try {
    const events = await getEvents();
    const availByRole = await getAvailabilityByRole();
    const membersByRole = await getMembersByRole();

    const lines: string[] = [];
    // Header: Event, Date, Role, Person, Availability
    lines.push(["Event", "Date", "Role", "Person", "Availability"].join(","));

    events.forEach((event) => {
      Object.entries(membersByRole).forEach(([role, people]) => {
        const roleAvail = availByRole[event.date]?.[role] || [];
        people.forEach((person) => {
          const personAvail = roleAvail.find((a) => a.id === person.id);
          const state = personAvail ? personAvail.state : "";
          lines.push(
            [
              `"${event.title}"`,
              event.date,
              role,
              `"${person.name}"`,
              state,
            ].join(",")
          );
        });
      });
    });

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=availability.csv",
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/export/csv:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
