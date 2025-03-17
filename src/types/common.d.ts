// src/types/common.d.ts
// This file defines common type extensions and modifications

import { Policy } from './policy.types';
import { Rule } from './rule.types';
import { Agent } from './agent.types';

// Define interfaces for hooks parameters
export interface RulePageParams {
  id: string;
}

// Fix missing types for login/registration credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

// For Policy components
declare module './policy.types' {
  interface Policy {
    policyType: PolicyType; // Make this required for Policy interface
  }
}

// For Rule components
declare module './rule.types' {
  interface Rule {
    active: boolean; // Make this required for Rule interface
  }
}

// For Agent components
declare module './agent.types' {
  interface Agent {
    active: boolean; // Make this required for Agent interface
  }
}

// Type declarations for jwt-decode (if not installed)
declare module 'jwt-decode' {
  export default function jwtDecode<T = any>(token: string): T;
}
