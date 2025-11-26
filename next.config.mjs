const nextConfig = {
  // Mirror settings from next.config.ts so Docker build doesn't need to load .ts
  reactCompiler: true,
};

export default nextConfig;
import nextConfig from './next.config.ts';

// Export as ESM for Next.js runtime. Keep behavior from existing TS file.
export default nextConfig;
