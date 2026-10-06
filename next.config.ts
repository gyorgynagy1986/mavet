import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Action body limit defaults to 1 MB; the profile photo upload needs more.
  // (Vercel caps the request body at 4.5 MB, so the client downsizes the photo first.)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
