/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // reactCompiler: true,
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
