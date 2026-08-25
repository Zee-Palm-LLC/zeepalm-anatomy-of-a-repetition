import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't scatter generated agent files through a repo meant to be read.
  agentRules: false,
};

export default nextConfig;
