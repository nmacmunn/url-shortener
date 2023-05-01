/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  coverageReporters: ["text"],
  preset: "ts-jest",
  testEnvironment: "node",
};
