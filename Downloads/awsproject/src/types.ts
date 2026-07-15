/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Super Admin'
  | 'Disaster Management Authority'
  | 'NGO'
  | 'Shelter Manager'
  | 'Volunteer'
  | 'Public User';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  organization?: string;
  active: boolean;
  phone?: string;
}

export type DisasterType = 'Flood' | 'Cyclone' | 'Earthquake' | 'Wildfire' | 'Landslide' | 'Tsunami';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type DisasterStatus = 'Active' | 'Contained' | 'Resolved';

export interface Disaster {
  id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  location: string;
  affected: number;
  startDate: string;
  status: DisasterStatus;
  description: string;
  coordinates: { x: number; y: number }; // Relative percentage coordinates for our custom interactive visual map
}

export interface Shelter {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  availableBeds: number;
  medicalFacilities: boolean;
  foodAvailability: boolean;
  waterAvailability: boolean;
  electricity: boolean;
  contact: string;
  location: string;
  coordinates: { x: number; y: number };
  status: 'Active' | 'Full' | 'Inactive';
}

export type ResourceCategory = 'Food' | 'Water' | 'Blankets' | 'Medicine' | 'Baby Food' | 'Fuel' | 'Medical Kits' | 'Clothes';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  stock: number;
  reserved: number;
  delivered: number;
  unit: string;
  warehouse: string;
  supplier: string;
  expiryDate?: string;
}

export type RequestPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RequestStatus = 'Pending' | 'Approved' | 'Assigned' | 'In Transit' | 'Delivered' | 'Completed';

export interface ResourceRequest {
  id: string;
  shelterId: string;
  shelterName: string;
  items: { item: string; quantity: number }[];
  priority: RequestPriority;
  status: RequestStatus;
  date: string;
  assignedNgoId?: string;
  assignedNgoName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
}

export interface NGO {
  id: string;
  name: string;
  contact: string;
  email: string;
  activeTasks: number;
  completedDeliveries: number;
  area: string;
  rating: number;
  performanceScore: number; // 0 - 100
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  availability: 'Available' | 'Busy' | 'Offline';
  vehicle: string;
  vehicleNo: string;
  currentLocation: string;
  rating: number;
  completedTasks: number;
  emergencyContact: string;
  coordinates: { x: number; y: number };
}

export interface Delivery {
  id: string;
  requestId: string;
  shelterId: string;
  shelterName: string;
  ngoId?: string;
  ngoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  vehicle: string;
  status: 'Dispatched' | 'In Transit' | 'Near Shelter' | 'Delivered';
  estimatedArrival: string;
  deliveryProofUrl?: string;
  timeline: { status: string; timestamp: string; note: string }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
}
