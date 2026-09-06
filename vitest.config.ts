import { defineConfig } from "vitest/config";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    css: false,
    alias: {
      "\\.(jpg|jpeg|png|gif|svg|webp)$": path.resolve(
        __dirname,
        "./src/test/__mocks__/fileMock.ts",
      ),
    },
  },
});
