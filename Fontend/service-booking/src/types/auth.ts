export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  fullName: string;
  role?: string;
}

export interface User {
  fullName: string;
  email: string;
  role: string; // 'Admin' | 'Customer'
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
