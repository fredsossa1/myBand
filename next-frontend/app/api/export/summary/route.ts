import { NextRequest, NextResponse } from "next/server";
import { getEvents, getAvailabilityByRole } from "@/lib/db";

export async function GET() {
  try {
    const events = await getEvents();
    const availByRole = await getAvailabilityByRole();

    const text = events
      .map((event) => {
        let summary = `\n📅 ${event.title} - ${event.date}\n`;
        if (event.description) summary += `   ${event.description}\n`;

        Object.entries(availByRole[event.date] || {}).forEach(
          ([role, people]) => {
            const available = people.filter((p) => p.state === "A");
            const unavailable = people.filter((p) => p.state === "U");

            summary += `\n${role.toUpperCase()}:\n`;
            if (available.length) {
              summary += `  ✅ Available: ${available
                .map((p) => p.name)
                .join(", ")}\n`;
            }
            if (unavailable.length) {
              summary += `  ❌ Unavailable: ${unavailable
                .map((p) => p.name)
                .join(", ")}\n`;
            }
          }
        );

        return summary;
      })
      .join("\n" + "=".repeat(50) + "\n");

    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": "attachment; filename=availability-summary.txt",
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/export/summary:", error);
    return NextResponse.json(
      { error: "Failed to export summary" },
      { status: 500 }
    );
  }
}
