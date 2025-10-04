import { User, LoginRequest, SignupRequest, AuthTokens } from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const authApi = {
  async signup(data: SignupRequest): Promise<{ user: User; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    return response.json();
  },

  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },

  async verifyToken(token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  },

  async logout(refreshToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  },
};
