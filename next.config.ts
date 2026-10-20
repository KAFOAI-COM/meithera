import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The repo may be opened from a git worktree inside the main checkout; pin the root so file tracing is correct.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
