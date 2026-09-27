// Local storage is replaced by an in-memory version in tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  // jest.mock factories run before imports, so the mock has to be required here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
