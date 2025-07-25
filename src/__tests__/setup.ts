import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock fetch API globals for Next.js server components
global.Request = jest.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || 'GET',
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
})) as any

global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  status: init?.status || 200,
  headers: new Headers(init?.headers || {}),
  json: jest.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  text: jest.fn().mockResolvedValue(body || ''),
})) as any

global.Headers = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  forEach: jest.fn(),
})) as any
