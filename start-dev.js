#!/usr/bin/env node
/**
 * PalmAstro Development Startup Script
 * This script starts both frontend and backend in development mode
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} found`, colors.green);
    return true;
  } else {
    log(`❌ ${description} not found at ${filePath}`, colors.red);
    return false;
  }
}

function startProcess(command, args, cwd, name, color) {
  log(`🚀 Starting ${name}...`, color);

  const process = spawn(command, args, {
    cwd,
    stdio: "pipe",
    shell: true,
  });

  process.stdout.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, color);
    }
  });

  process.stderr.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, colors.red);
    }
  });

  process.on("close", (code) => {
    if (code === 0) {
      log(`✅ ${name} exited successfully`, colors.green);
    } else {
      log(`❌ ${name} exited with code ${code}`, colors.red);
    }
  });

  return process;
}

async function main() {
  log(
    "🌟 Starting PalmAstro Development Environment",
    colors.bright + colors.cyan,
  );
  log("=" * 60, colors.cyan);

  // Check if package.json exists (frontend)
  if (!checkFile("package.json", "Frontend package.json")) {
    log(
      "Please run this script from the root directory of PalmAstro",
      colors.red,
    );
    process.exit(1);
  }

  // Check if backend directory exists
  if (!checkFile("backend", "Backend directory")) {
    log("Backend directory not found. Setting up backend...", colors.yellow);
  }

  // Start frontend (Vite dev server)
  log("\n📦 Starting Frontend (React + Vite)...", colors.blue);
  const frontend = startProcess(
    "npm",
    ["run", "dev"],
    ".",
    "Frontend",
    colors.blue,
  );

  // Give frontend a moment to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Start backend (Django dev server) if available
  const backendPath = path.join(__dirname, "backend");
  if (fs.existsSync(backendPath)) {
    log("\n🐍 Starting Backend (Django)...", colors.magenta);

    // Check if virtual environment exists
    const venvPath = path.join(backendPath, "venv");
    if (fs.existsSync(venvPath)) {
      const pythonCmd =
        process.platform === "win32"
          ? path.join(venvPath, "Scripts", "python")
          : path.join(venvPath, "bin", "python");

      const backend = startProcess(
        pythonCmd,
        ["manage.py", "runserver", "8000"],
        backendPath,
        "Backend",
        colors.magenta,
      );
    } else {
      log(
        "⚠️  Backend virtual environment not found. Run backend setup first:",
        colors.yellow,
      );
      log("   cd backend && python setup.py", colors.yellow);
      log("   Using mock API for now...", colors.yellow);
    }
  } else {
    log(
      "⚠️  Backend not found. Using mock API for development.",
      colors.yellow,
    );
  }

  // Display startup information
  setTimeout(() => {
    log(
      "\n🎉 PalmAstro Development Environment Started!",
      colors.bright + colors.green,
    );
    log("=" * 50, colors.green);
    log("Frontend: http://localhost:3000", colors.green);
    log("Backend:  http://localhost:8000 (if available)", colors.green);
    log(
      "API Docs: http://localhost:8000/api/docs/ (if available)",
      colors.green,
    );
    log("\n💡 Tips:", colors.yellow);
    log("- Frontend uses mock API by default", colors.yellow);
    log(
      "- Set VITE_USE_MOCK_API=false in .env to use real backend",
      colors.yellow,
    );
    log("- Press Ctrl+C to stop all services", colors.yellow);
    log("\n🔧 If you encounter issues:", colors.cyan);
    log(
      "1. Check that all dependencies are installed: npm install",
      colors.cyan,
    );
    log("2. Set up backend: cd backend && python setup.py", colors.cyan);
    log("3. Check the .env file for configuration", colors.cyan);
  }, 3000);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log(
      "\n🛑 Shutting down PalmAstro development environment...",
      colors.yellow,
    );
    frontend.kill();
    process.exit(0);
  });
}

main().catch((error) => {
  log(
    `❌ Error starting development environment: ${error.message}`,
    colors.red,
  );
  process.exit(1);
});
