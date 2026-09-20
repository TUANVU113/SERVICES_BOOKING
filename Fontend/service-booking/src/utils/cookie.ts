import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const USER_KEY = "user_fullName";
const ROLE_KEY = "user_role";

export const cookieStorage = {
  // Set auth token in cookies (default 7 days expiry)
  setToken: (token: string, days: number = 7) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: days,
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
    });
  },

  // Get auth token from cookies
  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
  },

  // Remove token from cookies
  removeToken: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
  },

  // Store user full name
  setFullName: (fullName: string, days: number = 7) => {
    Cookies.set(USER_KEY, fullName, {
      expires: days,
      path: "/",
    });
  },

  // Get user full name
  getFullName: (): string | undefined => {
    return Cookies.get(USER_KEY);
  },

  // Store user role
  setRole: (role: string, days: number = 7) => {
    Cookies.set(ROLE_KEY, role, {
      expires: days,
      path: "/",
    });
  },

  // Get user role
  getRole: (): string | undefined => {
    return Cookies.get(ROLE_KEY);
  },

  // Clear all auth cookie data
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    Cookies.remove(USER_KEY, { path: "/" });
    Cookies.remove(ROLE_KEY, { path: "/" });
  },
};
