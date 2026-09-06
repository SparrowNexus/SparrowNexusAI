import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const common = { stdio: "inherit", windowsHide: false };

const server = spawn(process.execPath, ["server.js"], common);
const vite = spawn(npm, ["run", "dev:client"], { ...common, shell: process.platform === "win32" });

const stop = () => {
  server.kill();
  vite.kill();
  process.exit();
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

server.on("error", (err) => {
  console.error("Backend failed to start:", err);
  vite.kill();
  process.exit(1);
});

vite.on("error", (err) => {
  console.error("Vite failed to start:", err);
  server.kill();
  process.exit(1);
});

server.on("exit", (code) => {
  if (code && code !== 0) {
    vite.kill();
    process.exit(code);
  }
});

vite.on("exit", (code) => {
  if (code && code !== 0) {
    server.kill();
    process.exit(code);
  }
});
