import assert from "assert";
import { buildCSV, buildSummary } from "../src/export.js";

const mock = {
  dates: ["2025-09-07", "2025-09-14"],
  members: {
    bassist: "Alice",
    drummer: "Bob",
    pianist: "Carol",
    lead: "Dave",
    bv1: "Eve",
    bv2: "Frank",
  },
  availability: {
    "2025-09-07": {
      bassist: "A",
      drummer: "U",
      pianist: "A",
      lead: "A",
      bv1: "?",
      bv2: "A",
    },
    "2025-09-14": {
      bassist: "U",
      drummer: "A",
      pianist: "?",
      lead: "A",
      bv1: "U",
      bv2: "A",
    },
  },
};

const csv = buildCSV(mock).trim();
assert(csv.split("\n").length === 3, "CSV should have header + 2 rows");
assert(csv.includes("2025-09-07"), "CSV includes first date");

const summary = buildSummary(mock);
assert(summary.includes("bassist:A"), "Summary maps symbols");

console.log("All tests passed");
