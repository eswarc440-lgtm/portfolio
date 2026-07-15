/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { Disaster, Shelter, ResourceItem, ResourceRequest } from '../types';

// Custom Enterprise API Error class for frontend handling
export class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for unified Axios error processing
const handleAxiosError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;
    const details = error.response?.data?.details;
    throw new ApiError(message, status, details);
  }
  throw new ApiError(error.message || 'An unexpected network error occurred.');
};

// --- DATA VALIDATORS ---

export const validateDisaster = (item: Partial<Disaster>): void => {
  if (!item.title || !item.title.trim()) {
    throw new ApiError('Disaster Title is required and cannot be empty.');
  }
  if (!item.type) {
    throw new ApiError('Disaster Type is required.');
  }
  if (!item.severity || !['Critical', 'High', 'Medium', 'Low'].includes(item.severity)) {
    throw new ApiError('Valid Severity Level (Critical, High, Medium, Low) is required.');
  }
  if (!item.location || !item.location.trim()) {
    throw new ApiError('Geographical location description is required.');
  }
  if (item.affected === undefined || typeof item.affected !== 'number' || item.affected < 0) {
    throw new ApiError('Affected population size must be 0 or a positive integer.');
  }
  if (!item.startDate) {
    throw new ApiError('Start date is required.');
  }
  if (!item.status || !['Active', 'Contained', 'Resolved'].includes(item.status)) {
    throw new ApiError('Valid Disaster status (Active, Contained, Resolved) is required.');
  }
  if (!item.coordinates || typeof item.coordinates.x !== 'number' || typeof item.coordinates.y !== 'number') {
    throw new ApiError('Coordinate mapping (x, y percentages) is required.');
  }
};

export const validateShelter = (item: Partial<Shelter>): void => {
  if (!item.name || !item.name.trim()) {
    throw new ApiError('Humanitarian shelter site name is required.');
  }
  if (item.capacity === undefined || typeof item.capacity !== 'number' || item.capacity <= 0) {
    throw new ApiError('Shelter maximum capacity must be a positive integer.');
  }
  if (item.occupancy === undefined || typeof item.occupancy !== 'number' || item.occupancy < 0) {
    throw new ApiError('Current shelter occupancy cannot be negative.');
  }
  if (item.occupancy > item.capacity) {
    throw new ApiError('Current shelter occupancy cannot exceed maximum registered capacity.');
  }
  if (!item.contact || !item.contact.trim()) {
    throw new ApiError('Shelter emergency contact phone number is required.');
  }
  if (!item.location || !item.location.trim()) {
    throw new ApiError('Physical shelter location address is required.');
  }
  if (!item.coordinates || typeof item.coordinates.x !== 'number' || typeof item.coordinates.y !== 'number') {
    throw new ApiError('Geographic plot coordinates (x, y) are required.');
  }
};

export const validateResource = (item: Partial<ResourceItem>): void => {
  if (!item.name || !item.name.trim()) {
    throw new ApiError('Supply item name is required.');
  }
  if (!item.category) {
    throw new ApiError('Supply category category is required.');
  }
  if (item.stock === undefined || typeof item.stock !== 'number' || item.stock < 0) {
    throw new ApiError('Active stock level must be 0 or a positive number.');
  }
  if (item.reserved === undefined || typeof item.reserved !== 'number' || item.reserved < 0) {
    throw new ApiError('Reserved inventory allocation must be 0 or a positive number.');
  }
  if (item.delivered === undefined || typeof item.delivered !== 'number' || item.delivered < 0) {
    throw new ApiError('Historic delivered items cannot be negative.');
  }
  if (!item.unit || !item.unit.trim()) {
    throw new ApiError('Unit of measurement specification (e.g. Meals, Liters, Kits) is required.');
  }
  if (!item.warehouse || !item.warehouse.trim()) {
    throw new ApiError('Distribution warehouse / logistics depot description is required.');
  }
  if (!item.supplier || !item.supplier.trim()) {
    throw new ApiError('Registered supplier name is required.');
  }
};

export const validateRequest = (item: Partial<ResourceRequest>): void => {
  if (!item.shelterId || !item.shelterId.trim()) {
    throw new ApiError('Shelter Identifier is required.');
  }
  if (!item.shelterName || !item.shelterName.trim()) {
    throw new ApiError('Shelter Name is required.');
  }
  if (!Array.isArray(item.items) || item.items.length === 0) {
    throw new ApiError('Request must contain at least one item quantity specification.');
  }
  for (const it of item.items) {
    if (!it.item || !it.item.trim()) {
      throw new ApiError('Supply item descriptions cannot be empty.');
    }
    if (it.quantity === undefined || typeof it.quantity !== 'number' || it.quantity <= 0) {
      throw new ApiError('Requested quantities must be positive integers.');
    }
  }
  if (!item.priority || !['Critical', 'High', 'Medium', 'Low'].includes(item.priority)) {
    throw new ApiError('Valid Priority Level (Critical, High, Medium, Low) is required.');
  }
  if (!item.status || !['Pending', 'Approved', 'Assigned', 'In Transit', 'Delivered', 'Completed'].includes(item.status)) {
    throw new ApiError('Valid Resource Request status is required.');
  }
};

// --- REST API SERVICES ---

export const apiService = {
  /**
   * Disaster CRUD Services
   */
  disasters: {
    async getAll(): Promise<Disaster[]> {
      try {
        const response = await API.get<Disaster[]>('/disasters');
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async create(item: Omit<Disaster, 'id'> & { id?: string }): Promise<Disaster> {
      try {
        const id = item.id || `dis-${Date.now()}`;
        const payload: Disaster = { ...item, id } as Disaster;
        validateDisaster(payload);
        const response = await API.post<Disaster>('/disasters', payload);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async update(item: Disaster): Promise<Disaster> {
      try {
        validateDisaster(item);
        const response = await API.put<Disaster>(`/disasters/${item.id}`, item);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async delete(id: string): Promise<void> {
      try {
        if (!id) throw new ApiError('Invalid ID provided for deletion.');
        await API.delete(`/disasters/${id}`);
      } catch (error) {
        handleAxiosError(error);
      }
    },
  },

  /**
   * Shelter CRUD Services
   */
  shelters: {
    async getAll(): Promise<Shelter[]> {
      try {
        const response = await API.get<Shelter[]>('/shelters');
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async create(item: Omit<Shelter, 'id' | 'occupancy' | 'availableBeds' | 'status'> & { id?: string }): Promise<Shelter> {
      try {
        const id = item.id || `sh-${Date.now()}`;
        const payload: Shelter = {
          ...item,
          id,
          occupancy: 0,
          availableBeds: item.capacity,
          status: 'Active',
        };
        validateShelter(payload);
        const response = await API.post<Shelter>('/shelters', payload);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async update(item: Shelter): Promise<Shelter> {
      try {
        // Automatically recalculate capacities as per business logic rules before validating and sending
        const beds = item.capacity - item.occupancy;
        const status = beds <= 0 ? 'Full' : 'Active';
        const payload: Shelter = {
          ...item,
          availableBeds: Math.max(0, beds),
          status,
        };
        validateShelter(payload);
        const response = await API.put<Shelter>(`/shelters/${payload.id}`, payload);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async delete(id: string): Promise<void> {
      try {
        if (!id) throw new ApiError('Invalid ID provided for deletion.');
        await API.delete(`/shelters/${id}`);
      } catch (error) {
        handleAxiosError(error);
      }
    },
  },

  /**
   * Resource CRUD Services
   */
  resources: {
    async getAll(): Promise<ResourceItem[]> {
      try {
        const response = await API.get<ResourceItem[]>('/resources');
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async create(item: Omit<ResourceItem, 'id'> & { id?: string }): Promise<ResourceItem> {
      try {
        const id = item.id || `res-${Date.now()}`;
        const payload: ResourceItem = { ...item, id } as ResourceItem;
        validateResource(payload);
        const response = await API.post<ResourceItem>('/resources', payload);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async update(item: ResourceItem): Promise<ResourceItem> {
      try {
        validateResource(item);
        const response = await API.put<ResourceItem>(`/resources/${item.id}`, item);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async delete(id: string): Promise<void> {
      try {
        if (!id) throw new ApiError('Invalid ID provided for deletion.');
        await API.delete(`/resources/${id}`);
      } catch (error) {
        handleAxiosError(error);
      }
    },
  },

  /**
   * Resource Requests CRUD Services
   */
  requests: {
    async getAll(): Promise<ResourceRequest[]> {
      try {
        const response = await API.get<ResourceRequest[]>('/requests');
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async create(item: Omit<ResourceRequest, 'id' | 'status' | 'date'> & { id?: string; status?: ResourceRequest['status']; date?: string }): Promise<ResourceRequest> {
      try {
        const id = item.id || `req-${Date.now()}`;
        const payload: ResourceRequest = {
          ...item,
          id,
          status: item.status || 'Pending',
          date: item.date || new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        validateRequest(payload);
        const response = await API.post<ResourceRequest>('/requests', payload);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async update(item: ResourceRequest): Promise<ResourceRequest> {
      try {
        validateRequest(item);
        const response = await API.put<ResourceRequest>(`/requests/${item.id}`, item);
        return response.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async delete(id: string): Promise<void> {
      try {
        if (!id) throw new ApiError('Invalid ID provided for deletion.');
        await API.delete(`/requests/${id}`);
      } catch (error) {
        handleAxiosError(error);
      }
    },
  },
};
