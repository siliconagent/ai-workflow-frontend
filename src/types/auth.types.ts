/**
 * Authentication and user-related types
 */

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    isActive: boolean;
    organization?: string;
    teamId?: string;
    metadata?: Record<string, any>;
  }
  
  export interface UserProfile extends User {
    avatar?: string;
    jobTitle?: string;
    department?: string;
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    preferences?: UserPreferences;
  }
  
  export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      inApp?: boolean;
      sms?: boolean;
    };
    dashboardLayout?: any;
  }
  
  export type UserRole = 'admin' | 'manager' | 'user' | 'developer' | 'guest';
  
  export interface Permission {
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }
  
  export interface PasswordResetRequest {
    email: string;
  }
  
  export interface PasswordUpdateRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: TeamMember[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TeamMember {
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }
  
  export interface Organization {
    id: string;
    name: string;
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    maxUsers: number;
    maxWorkflows: number;
    maxRules: number;
    features: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface InviteUserRequest {
    email: string;
    role: UserRole;
    teamId?: string;
    message?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
//   export interface AuthContextType extends AuthState {
//     login: (email: string, password: string) => Promise<void>;
//     register: (data: RegisterRequest) => Promise<void>;
//     logout: () => void;
//     refreshToken: () => Promise<boolean>;
//     resetPassword: (email: string) => Promise<void>;
//     updatePassword: (data: PasswordUpdateRequest) => Promise<void>;
//     updateProfile: (data: Partial<UserProfile>) => Promise<void>;
//     inviteUser: (data: InviteUserRequest) => Promise<void>;
//   }

  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (data: PasswordUpdateRequest) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    inviteUser: (data: InviteUserRequest) => Promise<void>;
    clearErrors: () => void;
  }

  export interface Session {
    userId: string;
    token: string;
    refreshToken: string;
    createdAt: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
  }
  
  export interface ApiKeyPermission {
    resource: string;
    action: string;
  }
  
  export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    userId: string;
    createdAt: string;
    expiresAt?: string;
    lastUsed?: string;
    permissions: ApiKeyPermission[];
    isActive: boolean;
  }
  
  export interface CreateApiKeyRequest {
    name: string;
    expiresIn?: number; // days
    permissions: ApiKeyPermission[];
  }
  
  export interface CreateApiKeyResponse {
    apiKey: ApiKey;
    key: string; // Full API key, only shown once
  }
  
  export interface MfaSettings {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
    phone?: string;
    backupCodes?: string[];
  }
  
  export interface VerifyMfaRequest {
    code: string;
    method: 'app' | 'sms' | 'email';
  }
  
  export interface VerifyMfaResponse {
    success: boolean;
    token?: string;
    backupCodes?: string[];
  }
  
  export interface LoginAttempt {
    id: string;
    userId: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    failureReason?: string;
  }
  
  export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }
