module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/test/tsconfig.json",
    },
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testEnvironment: "node",
  testTimeout: 600000,
  collectCoverage: true,
  coveragePathIgnorePatterns: ["<rootDir>/tests/", "<rootDir>/node_modules/"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
