// Auth store with Zustand
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { AuthUser, LoginCredentials, SignupCredentials } from "@/types";
import { apiClient } from "@/lib/api-client";
import { log } from "@/lib/log";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { AuthUserSchema, LoginCredentialsSchema, SignupCredentialsSchema } from "@/schemas";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: any) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// Mock auth service for development
const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === "demo@artisan.app" && credentials.password === "password") {
      const user: AuthUser = {
        id: "user_1",
        email: credentials.email,
        name: "Demo User",
        username: "demo_user",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      };
      
      return {
        user,
        token: "mock_jwt_token_123",
      };
    }
    
    throw new Error("Invalid credentials");
  },

  async signup(credentials: SignupCredentials): Promise<{ user: AuthUser; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: AuthUser = {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      username: credentials.username,
    };
    
    return {
      user,
      token: "mock_jwt_token_123",
    };
  },

  async getCurrentUser(token: string): Promise<AuthUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token === "mock_jwt_token_123") {
      return {
        id: "user_1",
        email: "demo@artisan.app",
        name: "Demo User",
        username: "demo_user",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      };
    }
    
    throw new Error("Invalid token");
  },
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      login: async (credentials: any) => {
        const validationResult = LoginCredentialsSchema.safeParse(credentials);
        if (!validationResult.success) {
          set({ error: "Invalid credentials format" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { user, token } = await mockAuthService.login(credentials);
          
          // Validate user response
          const userValidation = AuthUserSchema.safeParse(user);
          if (!userValidation.success) {
            throw new Error("Invalid user data received");
          }

          // Store token and update API client
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          apiClient.setAuthToken(token);

          set({
            user: userValidation.data as AuthUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          log.info("User logged in successfully", { userId: user.id });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          log.error("Login failed", { error: errorMessage });
        }
      },

      signup: async (credentials: SignupCredentials) => {
        const validationResult = SignupCredentialsSchema.safeParse(credentials);
        if (!validationResult.success) {
          set({ error: "Invalid signup data format" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { user, token } = await mockAuthService.signup(credentials);
          
          // Validate user response
          const userValidation = AuthUserSchema.safeParse(user);
          if (!userValidation.success) {
            throw new Error("Invalid user data received");
          }

          // Store token and update API client
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          apiClient.setAuthToken(token);

          set({
            user: userValidation.data as AuthUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          log.info("User signed up successfully", { userId: user.id });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Signup failed";
          set({ error: errorMessage, isLoading: false });
          log.error("Signup failed", { error: errorMessage });
        }
      },

      logout: () => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        apiClient.clearAuthToken();
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        log.info("User logged out");
      },

      checkAuth: async () => {
        const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await mockAuthService.getCurrentUser(token);
          
          // Validate user response
          const userValidation = AuthUserSchema.safeParse(user);
          if (!userValidation.success) {
            throw new Error("Invalid user data received");
          }

          apiClient.setAuthToken(token);
          
          set({
            user: userValidation.data as AuthUser,
            isAuthenticated: true,
            isLoading: false,
          });

          log.info("Auth check successful", { userId: user.id });
        } catch (error) {
          // Clear invalid token
          storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          apiClient.clearAuthToken();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          log.warn("Auth check failed, clearing token");
        }
      },

      clearError: () => set({ error: null }),
    })),
    { name: "auth-store" }
  )
);

// Initialize auth check on app start
useAuthStore.getState().checkAuth();