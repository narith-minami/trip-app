/**
 * src/mocks/api/users.ts
 *
 * Mock user API.
 */

const mockUser = {
  id: "user-1",
  name: "Dev User",
  email: "dev@example.com",
  image: null,
};

export async function fetchCurrentUser() {
  return mockUser;
}
