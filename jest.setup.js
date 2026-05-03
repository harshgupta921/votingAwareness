import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill for fetch and other web APIs if missing
if (!global.fetch) {
  const { fetch, Request, Response, Headers } = require('whatwg-fetch');
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}

// Global Mocks
jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn((cb) => cb(null)),
    signOut: jest.fn(),
    signInWithPopup: jest.fn(),
  },
  db: {},
  googleProvider: {},
}), { virtual: true });

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn(),
  initializeFirestore: jest.fn(),
  persistentLocalCache: jest.fn(),
  persistentMultipleTabManager: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(() => Promise.resolve({ id: 'new-id' })),
  deleteDoc: jest.fn(() => Promise.resolve()),
}), { virtual: true });

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    if (typeof auth === 'function') auth(null);
    else if (callback) callback(null);
    return () => {};
  }),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}), { virtual: true });
