const STORAGE_KEY = "availabilityData";

export function loadData(defaultMembers) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmpty(defaultMembers);
    const parsed = JSON.parse(raw);
    // Ensure members mapping stays consistent with config (1:1 roles)
    const mergedMembers = { ...parsed.members };
    Object.entries(defaultMembers).forEach(([role, name]) => {
      mergedMembers[role] = name;
    });
    return {
      dates: parsed.dates || [],
      members: mergedMembers,
      availability: parsed.availability || {},
    };
  } catch {
    return createEmpty(defaultMembers);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createEmpty(members) {
  return { dates: [], members: { ...members }, availability: {} };
}

export function reset(members) {
  const d = createEmpty(members);
  saveData(d);
  return d;
}
