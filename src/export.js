const ROLE_ORDER = ["bassist", "drummer", "pianist", "lead", "bv1", "bv2"];

export function buildCSV(data) {
  const rows = [];
  rows.push(["date", ...ROLE_ORDER].join(","));
  data.dates.forEach((date) => {
    const day = data.availability[date] || {};
    rows.push([date, ...ROLE_ORDER.map((r) => day[r] || "")].join(","));
  });
  return rows.join("\n");
}

export function buildSummary(data) {
  return data.dates
    .map((date) => {
      const day = data.availability[date] || {};
      const parts = ROLE_ORDER.map(
        (r) => `${r}:${symbolToWord(day[r] || "?")}`
      );
      return `${date} | ${parts.join(" ")}`;
    })
    .join("\n");
}

function symbolToWord(sym) {
  return sym === "A" ? "A" : sym === "U" ? "U" : "?";
}

export function importJSON(text, members) {
  const parsed = JSON.parse(text);
  // Basic validation
  if (!Array.isArray(parsed.dates) || typeof parsed.availability !== "object") {
    throw new Error("Invalid snapshot format");
  }
  // Force roles to existing set; strip extras.
  const cleanedAvail = {};
  parsed.dates.forEach((d) => {
    const day = parsed.availability[d] || {};
    cleanedAvail[d] = {};
    Object.keys(members).forEach((role) => {
      const v = day[role];
      if (v === "A" || v === "U" || v === "?") cleanedAvail[d][role] = v;
      else cleanedAvail[d][role] = "?";
    });
  });
  return {
    dates: Array.from(new Set(parsed.dates)).sort(),
    members: { ...members },
    availability: cleanedAvail,
  };
}
