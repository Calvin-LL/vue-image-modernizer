module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tests/tsconfig.json",
    },
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testEnvironment: "node",
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
