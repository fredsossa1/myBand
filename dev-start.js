#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting development servers...\n");

// Start API server
console.log("📡 Starting API server on port 5173...");
const apiServer = spawn("node", ["--no-deprecation", "server/server.js"], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: "development" },
  stdio: "inherit",
});

// Wait a moment then start Next.js
setTimeout(() => {
  console.log("⚛️  Starting Next.js frontend on port 3000...");
  const frontendServer = spawn("npm", ["run", "dev"], {
    cwd: join(__dirname, "next-frontend"),
    stdio: "inherit",
  });

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down servers...");
    apiServer.kill();
    frontendServer.kill();
    process.exit(0);
  });

  frontendServer.on("exit", (code) => {
    if (code !== 0) {
      console.log("❌ Frontend server exited with code", code);
      apiServer.kill();
      process.exit(code);
    }
  });
}, 2000);

apiServer.on("exit", (code) => {
  if (code !== 0) {
    console.log("❌ API server exited with code", code);
    process.exit(code);
  }
});

console.log("\n📋 Development servers starting:");
console.log("   API Server: http://localhost:5173");
console.log("   Frontend: http://localhost:3000");
console.log("   Press Ctrl+C to stop both servers\n");
