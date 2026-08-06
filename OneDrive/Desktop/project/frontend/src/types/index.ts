/**
 * Shared TypeScript Types and Interfaces
 */

// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  CITIZEN = 'CITIZEN',
}

// User Interface
export interface User {
  id: string
  email: string
  name: string
  role: UserRole | string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

// Authentication Responses
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// Infrastructure
export interface Infrastructure {
  id: string
  name: string
  location: string
  type: 'bridge' | 'building' | 'road' | 'tunnel' | 'dam' | 'other'
  status: 'operational' | 'maintenance' | 'at-risk' | 'damaged'
  health_score: number
  last_inspection: string
  owner_id: string
  created_at: string
  updated_at: string
}

// KPI Data
export interface KPI {
  label: string
  value: number
  trend: number
  unit?: string
}

// Notification
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}

// API Error Response
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
