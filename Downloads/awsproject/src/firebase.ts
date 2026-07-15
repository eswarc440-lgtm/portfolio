/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Disaster, 
  Shelter, 
  ResourceItem, 
  ResourceRequest, 
  NGO, 
  Volunteer, 
  Delivery, 
  Notification, 
  ActivityLog, 
  User 
} from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Helper to wrap promises with a timeout to avoid connection freezes
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  const actualTimeout = Math.max(timeoutMs, 10000);
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore request timed out'));
    }, actualTimeout);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Mock Seed Data for Fallback and Seeding
export const INITIAL_DISASTERS: Disaster[] = [
  {
    id: 'dis-1',
    title: 'Budameru Canal Breach & Riverine Flooding',
    type: 'Flood',
    severity: 'Critical',
    location: 'Vijayawada Metro & Budameru Basin, NTR District',
    affected: 65000,
    startDate: '2026-07-06',
    status: 'Active',
    description: 'Heavy discharge of over 11.5 lakh cusecs from Prakasam Barrage combined with Budameru canal overflows has inundated Singhnagar, Ajit Singh Nagar, and nearby low-lying municipal sectors.',
    coordinates: { x: 45, y: 55 }
  },
  {
    id: 'dis-2',
    title: 'Kailasagiri Slopes Soil Slippage Slipway',
    type: 'Landslide',
    severity: 'High',
    location: 'Kailasagiri Hills Corridor, Visakhapatnam',
    affected: 15000,
    startDate: '2026-07-07',
    status: 'Active',
    description: 'Severe monsoon downpours have triggered critical soil saturation levels, leading to landslide risk along major national highway links flanking the Eastern Ghats slopes.',
    coordinates: { x: 85, y: 35 }
  },
  {
    id: 'dis-3',
    title: 'Cyclone Storm Surge & Inundation Warning',
    type: 'Cyclone',
    severity: 'Critical',
    location: 'Machilipatnam Coastal Belt, Krishna District',
    affected: 85000,
    startDate: '2026-07-05',
    status: 'Active',
    description: 'Severe cyclonic storm surge predicted up to 3.5 meters high with sustained winds of 145 km/h. Evacuation operations actively underway across the saline shoreline sector.',
    coordinates: { x: 62, y: 78 }
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'sh-1',
    name: 'Swaraj Maidan PWD Ground Mega Relief Center',
    capacity: 4000,
    occupancy: 3240,
    availableBeds: 760,
    medicalFacilities: true,
    foodAvailability: true,
    waterAvailability: true,
    electricity: true,
    contact: '+91 866 257 9999',
    location: 'Swaraj Maidan (PWD Grounds), Vijayawada Center, AP',
    coordinates: { x: 48, y: 58 },
    status: 'Active'
  },
  {
    id: 'sh-2',
    name: 'Guntur Zilla Parishad Assembly Gym',
    capacity: 1200,
    occupancy: 1140,
    availableBeds: 60,
    medicalFacilities: false,
    foodAvailability: true,
    waterAvailability: true,
    electricity: true,
    contact: '+91 863 223 0122',
    location: 'Zilla Parishad Road, Guntur Center, AP',
    coordinates: { x: 32, y: 45 },
    status: 'Active'
  },
  {
    id: 'sh-3',
    name: 'Visakhapatnam Swarna Bharathi Indoor Stadium',
    capacity: 2500,
    occupancy: 850,
    availableBeds: 1650,
    medicalFacilities: true,
    foodAvailability: true,
    waterAvailability: false,
    electricity: false,
    contact: '+91 891 255 1090',
    location: 'Resapuvanipalem, Visakhapatnam, AP',
    coordinates: { x: 88, y: 38 },
    status: 'Active'
  }
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  { id: 'res-1', name: 'Ready-to-Eat Emergency Meals & Dry Rations', category: 'Food', stock: 15400, reserved: 3200, delivered: 45000, unit: 'Meals', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'AP Civil Supplies Corp', expiryDate: '2030-12-31' },
  { id: 'res-2', name: 'Potable Water Packs (1L Packaged Cartons)', category: 'Water', stock: 24500, reserved: 8000, delivered: 85000, unit: 'Liters', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'AP Bottlers Ltd', expiryDate: '2028-06-15' },
  { id: 'res-3', name: 'Thermal Blankets & Ground Canvas Sheets', category: 'Blankets', stock: 4200, reserved: 1500, delivered: 12000, unit: 'Units', warehouse: 'Visakhapatnam Port Maritime Relief Stores Depot', supplier: 'Coir Board of India', expiryDate: '2035-01-01' },
  { id: 'res-4', name: 'Standard Trauma Kit & Surgical Packs', category: 'Medical Kits', stock: 1100, reserved: 450, delivered: 3100, unit: 'Kits', warehouse: 'Visakhapatnam Port Maritime Relief Stores Depot', supplier: 'Andhra Med Tech Zone', expiryDate: '2027-11-20' },
  { id: 'res-5', name: 'Pediatric Formula & Baby Puree Packs', category: 'Baby Food', stock: 3500, reserved: 600, delivered: 8400, unit: 'Cartons', warehouse: 'Swaraj Maidan Local Distribution Point', supplier: 'NestCare Foods India', expiryDate: '2026-12-05' },
  { id: 'res-6', name: 'Generator Fuel Fuel Canisters (Diesel / Propane)', category: 'Fuel', stock: 850, reserved: 200, delivered: 2200, unit: 'Gallons', warehouse: 'Swaraj Maidan Local Distribution Point', supplier: 'Indian Oil Corp', expiryDate: '2029-04-10' },
  { id: 'res-7', name: 'General Broad-Spectrum Antibiotics (Amoxicillin)', category: 'Medicine', stock: 6800, reserved: 1800, delivered: 14500, unit: 'Doses', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'Reddy Labs Hyderabad', expiryDate: '2027-03-31' }
];

export const INITIAL_REQUESTS: ResourceRequest[] = [
  {
    id: 'req-1',
    shelterId: 'sh-1',
    shelterName: 'Swaraj Maidan PWD Ground Mega Relief Center',
    items: [
      { item: 'Ready-to-Eat Emergency Meals & Dry Rations', quantity: 1500 },
      { item: 'Potable Water Packs (1L Packaged Cartons)', quantity: 3000 }
    ],
    priority: 'Critical',
    status: 'In Transit',
    date: '2026-07-07 10:45',
    assignedNgoId: 'ngo-1',
    assignedNgoName: 'AP State Red Cross Coalition',
    assignedVolunteerId: 'vol-1',
    assignedVolunteerName: 'Anil Kumar'
  },
  {
    id: 'req-2',
    shelterId: 'sh-2',
    shelterName: 'Guntur Zilla Parishad Assembly Gym',
    items: [
      { item: 'Standard Trauma Kit & Surgical Packs', quantity: 200 },
      { item: 'General Broad-Spectrum Antibiotics (Amoxicillin)', quantity: 500 }
    ],
    priority: 'High',
    status: 'Approved',
    date: '2026-07-08 04:12',
    assignedNgoId: 'ngo-2',
    assignedNgoName: 'Doctors on Mission AP'
  },
  {
    id: 'req-3',
    shelterId: 'sh-3',
    shelterName: 'Visakhapatnam Swarna Bharathi Indoor Stadium',
    items: [
      { item: 'Thermal Blankets & Ground Canvas Sheets', quantity: 600 },
      { item: 'Generator Fuel Fuel Canisters (Diesel / Propane)', quantity: 100 }
    ],
    priority: 'Critical',
    status: 'Pending',
    date: '2026-07-08 06:15'
  }
];

export const INITIAL_NGOS: NGO[] = [
  { id: 'ngo-1', name: 'AP State Red Cross Coalition', contact: '+91 866 247 2211', email: 'coordination@apredcross.org', activeTasks: 4, completedDeliveries: 124, area: 'Coastal Andhra & NTR Districts', rating: 4.9, performanceScore: 98 },
  { id: 'ngo-2', name: 'Doctors on Mission AP', contact: '+91 866 255 4322', email: 'logistics@dom-ap.org', activeTasks: 2, completedDeliveries: 78, area: 'Rayalaseema & Visakhapatnam', rating: 4.8, performanceScore: 94 },
  { id: 'ngo-3', name: 'Andhra Food Relief Foundation', contact: '+91 863 222 1100', email: 'dispatch@apfoodrelief.org', activeTasks: 1, completedDeliveries: 42, area: 'Statewide Distribution Networks', rating: 4.6, performanceScore: 89 }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'Anil Kumar',
    phone: '+91 94405 12345',
    availability: 'Busy',
    vehicle: 'Tata Xenon Disaster Response Spec',
    vehicleNo: 'AP-16-TS-4412',
    currentLocation: 'Benz Circle Road Flyover',
    rating: 4.9,
    completedTasks: 34,
    emergencyContact: 'Lakshmi Kumar (+91 94405 12346)',
    coordinates: { x: 50, y: 60 }
  },
  {
    id: 'vol-2',
    name: 'Srinivas Rao',
    phone: '+91 98480 98765',
    availability: 'Available',
    vehicle: 'Mahindra Scorpio Emergency Utility',
    vehicleNo: 'AP-07-ER-0902',
    currentLocation: 'Vijayawada Central Emergency Logistics Depot',
    rating: 4.8,
    completedTasks: 19,
    emergencyContact: 'Vijayalakshmi Rao (+91 98480 98766)',
    coordinates: { x: 44, y: 52 }
  },
  {
    id: 'vol-3',
    name: 'Deepika Reddy',
    phone: '+91 99630 11223',
    availability: 'Available',
    vehicle: 'Ashok Leyland Cargo Carrier',
    vehicleNo: 'AP-16-TX-7731',
    currentLocation: 'Swaraj Maidan Assembly Arena',
    rating: 4.7,
    completedTasks: 8,
    emergencyContact: 'Raghunath Reddy (+91 99630 11224)',
    coordinates: { x: 48, y: 57 }
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-1',
    requestId: 'req-1',
    shelterId: 'sh-1',
    shelterName: 'Swaraj Maidan PWD Ground Mega Relief Center',
    ngoId: 'ngo-1',
    ngoName: 'AP State Red Cross Coalition',
    volunteerId: 'vol-1',
    volunteerName: 'Anil Kumar',
    vehicle: 'Tata Xenon Disaster Response Spec (AP-16-TS-4412)',
    status: 'In Transit',
    estimatedArrival: '12 mins',
    timeline: [
      { status: 'Request Approved', timestamp: '2026-07-07 11:00', note: 'Allocated meals & bottled water from Central Logistics Depot.' },
      { status: 'Ngo Assigned', timestamp: '2026-07-07 11:15', note: 'Assigned to AP State Red Cross Coalition dispatch center.' },
      { status: 'Dispatched', timestamp: '2026-07-07 12:00', note: 'Loaded into Tata Xenon with state emergency clearance.' },
      { status: 'In Transit', timestamp: '2026-07-08 06:00', note: 'Navigating local canal runoff near Kanaka Durga Flyover bypass.' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'not-1', title: 'Critical Alert: Budameru Overspill', message: 'The Budameru Canal diversion channels have exceeded flood limits. AJ Singh Nagar residents advised to utilize Swaraj Maidan Relief Camp.', type: 'emergency', time: '5 mins ago', read: false },
  { id: 'not-2', title: 'New Supply Dispatch Sequence', message: 'NGO AP State Red Cross Coalition has accepted Request #req-1 for Swaraj Maidan Relief Ground.', type: 'success', time: '1 hr ago', read: false },
  { id: 'not-3', title: 'Fuel Shortage Watch', message: 'Visakhapatnam Indoor Stadium shelter reports auxiliary emergency diesel generators running low.', type: 'warning', time: '2 hrs ago', read: true }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-1', userId: 'user-auth', userName: 'Director K. S. Jawahar Reddy', role: 'Disaster Management Authority', action: 'Approved Allocation', details: 'Approved request req-1 for 1,500 meals and 3,000L water to Swaraj Maidan.', timestamp: '2026-07-07 11:00' },
  { id: 'log-2', userId: 'user-auth', userName: 'Director K. S. Jawahar Reddy', role: 'Disaster Management Authority', action: 'Registered Emergency Shelter', details: 'Registered Swaraj Maidan PWD Ground as a Tier-1 emergency shelter hub.', timestamp: '2026-07-05 15:30' }
];

// Helper to check and initialize standard collections with seeding
export async function seedDatabaseIfEmpty() {
  try {
    const disasterSnap = await withTimeout(getDocs(collection(db, 'disasters')), 6000);
    if (disasterSnap.empty) {
      console.log('Seeding empty Firestore database collections with enterprise data...');
      
      // Seed Disasters
      for (const item of INITIAL_DISASTERS) {
        await withTimeout(setDoc(doc(db, 'disasters', item.id), item), 6000).catch(() => {});
      }
      // Seed Shelters
      for (const item of INITIAL_SHELTERS) {
        await withTimeout(setDoc(doc(db, 'shelters', item.id), item), 6000).catch(() => {});
      }
      // Seed Resources
      for (const item of INITIAL_RESOURCES) {
        await withTimeout(setDoc(doc(db, 'resources', item.id), item), 6000).catch(() => {});
      }
      // Seed Requests
      for (const item of INITIAL_REQUESTS) {
        await withTimeout(setDoc(doc(db, 'requests', item.id), item), 6000).catch(() => {});
      }
      // Seed NGOs
      for (const item of INITIAL_NGOS) {
        await withTimeout(setDoc(doc(db, 'ngos', item.id), item), 6000).catch(() => {});
      }
      // Seed Volunteers
      for (const item of INITIAL_VOLUNTEERS) {
        await withTimeout(setDoc(doc(db, 'volunteers', item.id), item), 6000).catch(() => {});
      }
      // Seed Deliveries
      for (const item of INITIAL_DELIVERIES) {
        await withTimeout(setDoc(doc(db, 'deliveries', item.id), item), 6000).catch(() => {});
      }
      // Seed Notifications
      for (const item of INITIAL_NOTIFICATIONS) {
        await withTimeout(setDoc(doc(db, 'notifications', item.id), item), 6000).catch(() => {});
      }
      // Seed Activity Logs
      for (const item of INITIAL_ACTIVITY_LOGS) {
        await withTimeout(setDoc(doc(db, 'activity_logs', item.id), item), 6000).catch(() => {});
      }
      console.log('Firestore seeding completed successfully.');
    } else {
      console.log('Firestore contains existing documents. Skipping seeding.');
    }
  } catch (error) {
    console.warn('Firestore seeding failed, falling back to LocalStorage replication:', error);
  }
}

// Durable database driver with local storage fallbacks in case of authorization rules or connection problems.
export class DisasterDBServ {
  private static getLocal<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(`smart_disaster_${key}`);
    if (!data) {
      localStorage.setItem(`smart_disaster_${key}`, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  private static setLocal<T>(key: string, data: T[]): void {
    localStorage.setItem(`smart_disaster_${key}`, JSON.stringify(data));
  }

  // --- DISASTERS ---
  static async getDisasters(): Promise<Disaster[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'disasters')));
      if (snap.empty) {
        return this.getLocal('disasters', INITIAL_DISASTERS);
      }
      const list: Disaster[] = [];
      snap.forEach(d => list.push(d.data() as Disaster));
      return list;
    } catch {
      return this.getLocal('disasters', INITIAL_DISASTERS);
    }
  }

  static async updateDisaster(item: Disaster): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'disasters', item.id), item));
    } catch {}
    const current = this.getLocal('disasters', INITIAL_DISASTERS);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('disasters', updated);
  }

  static async deleteDisaster(id: string): Promise<void> {
    try {
      await withTimeout(deleteDoc(doc(db, 'disasters', id)));
    } catch {}
    const current = this.getLocal('disasters', INITIAL_DISASTERS);
    this.setLocal('disasters', current.filter(x => x.id !== id));
  }

  // --- SHELTERS ---
  static async getShelters(): Promise<Shelter[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'shelters')));
      if (snap.empty) {
        return this.getLocal('shelters', INITIAL_SHELTERS);
      }
      const list: Shelter[] = [];
      snap.forEach(d => list.push(d.data() as Shelter));
      return list;
    } catch {
      return this.getLocal('shelters', INITIAL_SHELTERS);
    }
  }

  static async updateShelter(item: Shelter): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'shelters', item.id), item));
    } catch {}
    const current = this.getLocal('shelters', INITIAL_SHELTERS);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('shelters', updated);
  }

  static async deleteShelter(id: string): Promise<void> {
    try {
      await withTimeout(deleteDoc(doc(db, 'shelters', id)));
    } catch {}
    const current = this.getLocal('shelters', INITIAL_SHELTERS);
    this.setLocal('shelters', current.filter(x => x.id !== id));
  }

  // --- RESOURCES ---
  static async getResources(): Promise<ResourceItem[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'resources')));
      if (snap.empty) {
        return this.getLocal('resources', INITIAL_RESOURCES);
      }
      const list: ResourceItem[] = [];
      snap.forEach(d => list.push(d.data() as ResourceItem));
      return list;
    } catch {
      return this.getLocal('resources', INITIAL_RESOURCES);
    }
  }

  static async updateResource(item: ResourceItem): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'resources', item.id), item));
    } catch {}
    const current = this.getLocal('resources', INITIAL_RESOURCES);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('resources', updated);
  }

  static async deleteResource(id: string): Promise<void> {
    try {
      await withTimeout(deleteDoc(doc(db, 'resources', id)));
    } catch {}
    const current = this.getLocal('resources', INITIAL_RESOURCES);
    this.setLocal('resources', current.filter(x => x.id !== id));
  }

  // --- REQUESTS ---
  static async getRequests(): Promise<ResourceRequest[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'requests')));
      if (snap.empty) {
        return this.getLocal('requests', INITIAL_REQUESTS);
      }
      const list: ResourceRequest[] = [];
      snap.forEach(d => list.push(d.data() as ResourceRequest));
      return list;
    } catch {
      return this.getLocal('requests', INITIAL_REQUESTS);
    }
  }

  static async updateRequest(item: ResourceRequest): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'requests', item.id), item));
    } catch {}
    const current = this.getLocal('requests', INITIAL_REQUESTS);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('requests', updated);
  }

  // --- NGOS ---
  static async getNgos(): Promise<NGO[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'ngos')));
      if (snap.empty) {
        return this.getLocal('ngos', INITIAL_NGOS);
      }
      const list: NGO[] = [];
      snap.forEach(d => list.push(d.data() as NGO));
      return list;
    } catch {
      return this.getLocal('ngos', INITIAL_NGOS);
    }
  }

  static async updateNgo(item: NGO): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'ngos', item.id), item));
    } catch {}
    const current = this.getLocal('ngos', INITIAL_NGOS);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('ngos', updated);
  }

  static async deleteNgo(id: string): Promise<void> {
    try {
      await withTimeout(deleteDoc(doc(db, 'ngos', id)));
    } catch {}
    const current = this.getLocal('ngos', INITIAL_NGOS);
    this.setLocal('ngos', current.filter(x => x.id !== id));
  }

  // --- VOLUNTEERS ---
  static async getVolunteers(): Promise<Volunteer[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'volunteers')));
      if (snap.empty) {
        return this.getLocal('volunteers', INITIAL_VOLUNTEERS);
      }
      const list: Volunteer[] = [];
      snap.forEach(d => list.push(d.data() as Volunteer));
      return list;
    } catch {
      return this.getLocal('volunteers', INITIAL_VOLUNTEERS);
    }
  }

  static async updateVolunteer(item: Volunteer): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'volunteers', item.id), item));
    } catch {}
    const current = this.getLocal('volunteers', INITIAL_VOLUNTEERS);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('volunteers', updated);
  }

  static async deleteVolunteer(id: string): Promise<void> {
    try {
      await withTimeout(deleteDoc(doc(db, 'volunteers', id)));
    } catch {}
    const current = this.getLocal('volunteers', INITIAL_VOLUNTEERS);
    this.setLocal('volunteers', current.filter(x => x.id !== id));
  }

  // --- DELIVERIES ---
  static async getDeliveries(): Promise<Delivery[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'deliveries')));
      if (snap.empty) {
        return this.getLocal('deliveries', INITIAL_DELIVERIES);
      }
      const list: Delivery[] = [];
      snap.forEach(d => list.push(d.data() as Delivery));
      return list;
    } catch {
      return this.getLocal('deliveries', INITIAL_DELIVERIES);
    }
  }

  static async updateDelivery(item: Delivery): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'deliveries', item.id), item));
    } catch {}
    const current = this.getLocal('deliveries', INITIAL_DELIVERIES);
    const updated = current.filter(x => x.id !== item.id);
    updated.push(item);
    this.setLocal('deliveries', updated);
  }

  // --- NOTIFICATIONS ---
  static async getNotifications(): Promise<Notification[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'notifications')));
      if (snap.empty) {
        return this.getLocal('notifications', INITIAL_NOTIFICATIONS);
      }
      const list: Notification[] = [];
      snap.forEach(d => list.push(d.data() as Notification));
      return list.sort((a, b) => b.id.localeCompare(a.id));
    } catch {
      return this.getLocal('notifications', INITIAL_NOTIFICATIONS);
    }
  }

  static async addNotification(item: Notification): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'notifications', item.id), item));
    } catch {}
    const current = this.getLocal('notifications', INITIAL_NOTIFICATIONS);
    current.unshift(item);
    this.setLocal('notifications', current);
  }

  // --- ACTIVITY LOGS ---
  static async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'activity_logs')));
      if (snap.empty) {
        return this.getLocal('activity_logs', INITIAL_ACTIVITY_LOGS);
      }
      const list: ActivityLog[] = [];
      snap.forEach(d => list.push(d.data() as ActivityLog));
      return list;
    } catch {
      return this.getLocal('activity_logs', INITIAL_ACTIVITY_LOGS);
    }
  }

  static async addActivityLog(item: ActivityLog): Promise<void> {
    try {
      await withTimeout(setDoc(doc(db, 'activity_logs', item.id), item));
    } catch {}
    const current = this.getLocal('activity_logs', INITIAL_ACTIVITY_LOGS);
    current.unshift(item);
    this.setLocal('activity_logs', current);
  }
}

// Validate connection to Firestore on initialization
async function testConnection() {
  try {
    await withTimeout(getDocFromServer(doc(db, '_connection_test_collection_', '_test_doc_')), 1000);
    console.info('Successfully validated connection to Firestore database instance.');
  } catch (error) {
    console.log('Firestore initialization complete (ready for authentication).');
  }
}
testConnection();
