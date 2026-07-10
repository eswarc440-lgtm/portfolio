/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase for server-side REST API access
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Helper to wrap server promises with a timeout to prevent hanging on Firestore network failures
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 800): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore operation timed out'));
    }, timeoutMs);
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

const INITIAL_DISASTERS = [
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

const INITIAL_SHELTERS = [
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

const INITIAL_RESOURCES = [
  { id: 'res-1', name: 'Ready-to-Eat Emergency Meals & Dry Rations', category: 'Food', stock: 15400, reserved: 3200, delivered: 45000, unit: 'Meals', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'AP Civil Supplies Corp', expiryDate: '2030-12-31' },
  { id: 'res-2', name: 'Potable Water Packs (1L Packaged Cartons)', category: 'Water', stock: 24500, reserved: 8000, delivered: 85000, unit: 'Liters', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'AP Bottlers Ltd', expiryDate: '2028-06-15' },
  { id: 'res-3', name: 'Thermal Blankets & Ground Canvas Sheets', category: 'Blankets', stock: 4200, reserved: 1500, delivered: 12000, unit: 'Units', warehouse: 'Visakhapatnam Port Maritime Relief Stores Depot', supplier: 'Coir Board of India', expiryDate: '2035-01-01' },
  { id: 'res-4', name: 'Standard Trauma Kit & Surgical Packs', category: 'Medical Kits', stock: 1100, reserved: 450, delivered: 3100, unit: 'Kits', warehouse: 'Visakhapatnam Port Maritime Relief Stores Depot', supplier: 'Andhra Med Tech Zone', expiryDate: '2027-11-20' },
  { id: 'res-5', name: 'Pediatric Formula & Baby Puree Packs', category: 'Baby Food', stock: 3500, reserved: 600, delivered: 8400, unit: 'Cartons', warehouse: 'Swaraj Maidan Local Distribution Point', supplier: 'NestCare Foods India', expiryDate: '2026-12-05' },
  { id: 'res-6', name: 'Generator Fuel Fuel Canisters (Diesel / Propane)', category: 'Fuel', stock: 850, reserved: 200, delivered: 2200, unit: 'Gallons', warehouse: 'Swaraj Maidan Local Distribution Point', supplier: 'Indian Oil Corp', expiryDate: '2029-04-10' },
  { id: 'res-7', name: 'General Broad-Spectrum Antibiotics (Amoxicillin)', category: 'Medicine', stock: 6800, reserved: 1800, delivered: 14500, unit: 'Doses', warehouse: 'Vijayawada Central Emergency Logistics Depot', supplier: 'Reddy Labs Hyderabad', expiryDate: '2027-03-31' }
];

const INITIAL_REQUESTS = [
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

let memoryDisasters = [...INITIAL_DISASTERS];
let memoryShelters = [...INITIAL_SHELTERS];
let memoryResources = [...INITIAL_RESOURCES];
let memoryRequests = [...INITIAL_REQUESTS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // DISASTERS REST ENDPOINTS
  // ==========================================

  // GET: Fetch all active/resolved disasters
  app.get('/api/disasters', async (req, res) => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'disasters')), 1000);
      const list: any[] = [];
      snap.forEach(d => list.push(d.data()));
      if (list.length > 0) {
        memoryDisasters = list;
      }
      res.json(memoryDisasters);
    } catch (error: any) {
      console.warn('REST getDisasters failed/timed out, falling back to memory cache:', error.message);
      res.json(memoryDisasters);
    }
  });

  // POST: Register/declare a new disaster
  app.post('/api/disasters', async (req, res) => {
    try {
      const disaster = req.body;

      // Schema level server-side validation
      if (!disaster.id) {
        return res.status(400).json({ error: 'Validation Error: Identifier "id" is mandatory.' });
      }
      if (!disaster.title || typeof disaster.title !== 'string' || !disaster.title.trim()) {
        return res.status(400).json({ error: 'Validation Error: "title" is required and must be a valid string.' });
      }
      if (!disaster.type || typeof disaster.type !== 'string') {
        return res.status(400).json({ error: 'Validation Error: "type" is required.' });
      }
      if (!disaster.severity || !['Critical', 'High', 'Medium', 'Low'].includes(disaster.severity)) {
        return res.status(400).json({ error: 'Validation Error: "severity" must be one of: Critical, High, Medium, Low.' });
      }
      if (!disaster.location || typeof disaster.location !== 'string' || !disaster.location.trim()) {
        return res.status(400).json({ error: 'Validation Error: "location" text is required.' });
      }
      if (typeof disaster.affected !== 'number' || disaster.affected < 0) {
        return res.status(400).json({ error: 'Validation Error: "affected" population size must be zero or a positive integer.' });
      }
      if (!disaster.startDate) {
        return res.status(400).json({ error: 'Validation Error: "startDate" is required.' });
      }
      if (!disaster.status || !['Active', 'Contained', 'Resolved'].includes(disaster.status)) {
        return res.status(400).json({ error: 'Validation Error: "status" must be Active, Contained, or Resolved.' });
      }
      if (!disaster.coordinates || typeof disaster.coordinates.x !== 'number' || typeof disaster.coordinates.y !== 'number') {
        return res.status(400).json({ error: 'Validation Error: "coordinates" object containing numeric x and y percent offsets is required.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'disasters', disaster.id), disaster), 1000);
      } catch (firestoreErr: any) {
        console.warn('POST disasters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryDisasters = memoryDisasters.filter(x => x.id !== disaster.id);
      memoryDisasters.push(disaster);
      res.status(201).json(disaster);
    } catch (error: any) {
      console.error('REST createDisaster failed:', error);
      res.status(500).json({ error: 'Server failed to write disaster record', details: error.message });
    }
  });

  // PUT: Update an existing disaster parameters
  app.put('/api/disasters/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const disaster = req.body;

      if (disaster.id && disaster.id !== id) {
        return res.status(400).json({ error: 'Endpoint ID parameter does not match body payload ID.' });
      }
      disaster.id = id;

      // Schema level server-side validation
      if (!disaster.title || typeof disaster.title !== 'string' || !disaster.title.trim()) {
        return res.status(400).json({ error: 'Validation Error: "title" is required and must be a valid string.' });
      }
      if (!disaster.type || typeof disaster.type !== 'string') {
        return res.status(400).json({ error: 'Validation Error: "type" is required.' });
      }
      if (!disaster.severity || !['Critical', 'High', 'Medium', 'Low'].includes(disaster.severity)) {
        return res.status(400).json({ error: 'Validation Error: "severity" must be one of: Critical, High, Medium, Low.' });
      }
      if (!disaster.location || typeof disaster.location !== 'string' || !disaster.location.trim()) {
        return res.status(400).json({ error: 'Validation Error: "location" text is required.' });
      }
      if (typeof disaster.affected !== 'number' || disaster.affected < 0) {
        return res.status(400).json({ error: 'Validation Error: "affected" population size must be zero or a positive integer.' });
      }
      if (!disaster.startDate) {
        return res.status(400).json({ error: 'Validation Error: "startDate" is required.' });
      }
      if (!disaster.status || !['Active', 'Contained', 'Resolved'].includes(disaster.status)) {
        return res.status(400).json({ error: 'Validation Error: "status" must be Active, Contained, or Resolved.' });
      }
      if (!disaster.coordinates || typeof disaster.coordinates.x !== 'number' || typeof disaster.coordinates.y !== 'number') {
        return res.status(400).json({ error: 'Validation Error: "coordinates" object containing numeric x and y percent offsets is required.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'disasters', id), disaster), 1000);
      } catch (firestoreErr: any) {
        console.warn('PUT disasters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryDisasters = memoryDisasters.filter(x => x.id !== id);
      memoryDisasters.push(disaster);
      res.json(disaster);
    } catch (error: any) {
      console.error('REST updateDisaster failed:', error);
      res.status(500).json({ error: 'Server failed to update disaster record', details: error.message });
    }
  });

  // DELETE: Remove a disaster
  app.delete('/api/disasters/:id', async (req, res) => {
    try {
      const id = req.params.id;
      try {
        await withTimeout(deleteDoc(doc(db, 'disasters', id)), 1000);
      } catch (firestoreErr: any) {
        console.warn('DELETE disasters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryDisasters = memoryDisasters.filter(x => x.id !== id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('REST deleteDisaster failed:', error);
      res.status(500).json({ error: 'Server failed to delete disaster record', details: error.message });
    }
  });

  // ==========================================
  // SHELTERS REST ENDPOINTS
  // ==========================================

  // GET: Fetch all humanitarian shelters
  app.get('/api/shelters', async (req, res) => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'shelters')), 1000);
      const list: any[] = [];
      snap.forEach(d => list.push(d.data()));
      if (list.length > 0) {
        memoryShelters = list;
      }
      res.json(memoryShelters);
    } catch (error: any) {
      console.warn('REST getShelters failed/timed out, falling back to memory cache:', error.message);
      res.json(memoryShelters);
    }
  });

  // POST: Create a new shelter
  app.post('/api/shelters', async (req, res) => {
    try {
      const shelter = req.body;

      // Schema validation
      if (!shelter.id) {
        return res.status(400).json({ error: 'Validation Error: Shelter identifier "id" is mandatory.' });
      }
      if (!shelter.name || typeof shelter.name !== 'string' || !shelter.name.trim()) {
        return res.status(400).json({ error: 'Validation Error: "name" is required.' });
      }
      if (typeof shelter.capacity !== 'number' || shelter.capacity <= 0) {
        return res.status(400).json({ error: 'Validation Error: "capacity" must be a positive integer.' });
      }
      if (typeof shelter.occupancy !== 'number' || shelter.occupancy < 0) {
        return res.status(400).json({ error: 'Validation Error: "occupancy" cannot be negative.' });
      }
      if (shelter.occupancy > shelter.capacity) {
        return res.status(400).json({ error: 'Validation Error: "occupancy" cannot exceed "capacity".' });
      }
      if (typeof shelter.medicalFacilities !== 'boolean' || typeof shelter.foodAvailability !== 'boolean' ||
          typeof shelter.waterAvailability !== 'boolean' || typeof shelter.electricity !== 'boolean') {
        return res.status(400).json({ error: 'Validation Error: Facilities boolean flags must be true/false.' });
      }
      if (!shelter.contact || typeof shelter.contact !== 'string' || !shelter.contact.trim()) {
        return res.status(400).json({ error: 'Validation Error: Shelter "contact" phone is required.' });
      }
      if (!shelter.location || typeof shelter.location !== 'string' || !shelter.location.trim()) {
        return res.status(400).json({ error: 'Validation Error: "location" description address is required.' });
      }
      if (!shelter.coordinates || typeof shelter.coordinates.x !== 'number' || typeof shelter.coordinates.y !== 'number') {
        return res.status(400).json({ error: 'Validation Error: Plot coordinates (coordinates.x and coordinates.y) are required.' });
      }
      if (!shelter.status || !['Active', 'Full', 'Inactive'].includes(shelter.status)) {
        return res.status(400).json({ error: 'Validation Error: status must be Active, Full, or Inactive.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'shelters', shelter.id), shelter), 1000);
      } catch (firestoreErr: any) {
        console.warn('POST shelters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryShelters = memoryShelters.filter(x => x.id !== shelter.id);
      memoryShelters.push(shelter);
      res.status(201).json(shelter);
    } catch (error: any) {
      console.error('REST createShelter failed:', error);
      res.status(500).json({ error: 'Server failed to write shelter record', details: error.message });
    }
  });

  // PUT: Update an existing shelter
  app.put('/api/shelters/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const shelter = req.body;

      if (shelter.id && shelter.id !== id) {
        return res.status(400).json({ error: 'Endpoint ID parameter does not match body payload ID.' });
      }
      shelter.id = id;

      // Schema validation
      if (!shelter.name || typeof shelter.name !== 'string' || !shelter.name.trim()) {
        return res.status(400).json({ error: 'Validation Error: "name" is required.' });
      }
      if (typeof shelter.capacity !== 'number' || shelter.capacity <= 0) {
        return res.status(400).json({ error: 'Validation Error: "capacity" must be a positive integer.' });
      }
      if (typeof shelter.occupancy !== 'number' || shelter.occupancy < 0) {
        return res.status(400).json({ error: 'Validation Error: "occupancy" cannot be negative.' });
      }
      if (shelter.occupancy > shelter.capacity) {
        return res.status(400).json({ error: 'Validation Error: "occupancy" cannot exceed "capacity".' });
      }
      if (typeof shelter.medicalFacilities !== 'boolean' || typeof shelter.foodAvailability !== 'boolean' ||
          typeof shelter.waterAvailability !== 'boolean' || typeof shelter.electricity !== 'boolean') {
        return res.status(400).json({ error: 'Validation Error: Facilities boolean flags must be true/false.' });
      }
      if (!shelter.contact || typeof shelter.contact !== 'string' || !shelter.contact.trim()) {
        return res.status(400).json({ error: 'Validation Error: Shelter "contact" phone is required.' });
      }
      if (!shelter.location || typeof shelter.location !== 'string' || !shelter.location.trim()) {
        return res.status(400).json({ error: 'Validation Error: "location" description address is required.' });
      }
      if (!shelter.coordinates || typeof shelter.coordinates.x !== 'number' || typeof shelter.coordinates.y !== 'number') {
        return res.status(400).json({ error: 'Validation Error: Plot coordinates (coordinates.x and coordinates.y) are required.' });
      }
      if (!shelter.status || !['Active', 'Full', 'Inactive'].includes(shelter.status)) {
        return res.status(400).json({ error: 'Validation Error: status must be Active, Full, or Inactive.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'shelters', id), shelter), 1000);
      } catch (firestoreErr: any) {
        console.warn('PUT shelters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryShelters = memoryShelters.filter(x => x.id !== id);
      memoryShelters.push(shelter);
      res.json(shelter);
    } catch (error: any) {
      console.error('REST updateShelter failed:', error);
      res.status(500).json({ error: 'Server failed to update shelter record', details: error.message });
    }
  });

  // DELETE: Remove a shelter
  app.delete('/api/shelters/:id', async (req, res) => {
    try {
      const id = req.params.id;
      try {
        await withTimeout(deleteDoc(doc(db, 'shelters', id)), 1000);
      } catch (firestoreErr: any) {
        console.warn('DELETE shelters: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryShelters = memoryShelters.filter(x => x.id !== id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('REST deleteShelter failed:', error);
      res.status(500).json({ error: 'Server failed to delete shelter record', details: error.message });
    }
  });

  // ==========================================
  // RESOURCES REST ENDPOINTS
  // ==========================================

  // GET: Fetch all resources
  app.get('/api/resources', async (req, res) => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'resources')), 1000);
      const list: any[] = [];
      snap.forEach(d => list.push(d.data()));
      if (list.length > 0) {
        memoryResources = list;
      }
      res.json(memoryResources);
    } catch (error: any) {
      console.warn('REST getResources failed/timed out, falling back to memory cache:', error.message);
      res.json(memoryResources);
    }
  });

  // POST: Create a new resource item
  app.post('/api/resources', async (req, res) => {
    try {
      const resource = req.body;

      // Schema validation
      if (!resource.id) {
        return res.status(400).json({ error: 'Validation Error: Resource item identifier "id" is mandatory.' });
      }
      if (!resource.name || typeof resource.name !== 'string' || !resource.name.trim()) {
        return res.status(400).json({ error: 'Validation Error: Supply name is required.' });
      }
      if (!resource.category || typeof resource.category !== 'string') {
        return res.status(400).json({ error: 'Validation Error: Category is required.' });
      }
      if (typeof resource.stock !== 'number' || resource.stock < 0) {
        return res.status(400).json({ error: 'Validation Error: stock level must be zero or a positive number.' });
      }
      if (typeof resource.reserved !== 'number' || resource.reserved < 0) {
        return res.status(400).json({ error: 'Validation Error: reserved inventory cannot be negative.' });
      }
      if (typeof resource.delivered !== 'number' || resource.delivered < 0) {
        return res.status(400).json({ error: 'Validation Error: delivered count cannot be negative.' });
      }
      if (!resource.unit || typeof resource.unit !== 'string' || !resource.unit.trim()) {
        return res.status(400).json({ error: 'Validation Error: unit format is required.' });
      }
      if (!resource.warehouse || typeof resource.warehouse !== 'string' || !resource.warehouse.trim()) {
        return res.status(400).json({ error: 'Validation Error: storage warehouse name is required.' });
      }
      if (!resource.supplier || typeof resource.supplier !== 'string' || !resource.supplier.trim()) {
        return res.status(400).json({ error: 'Validation Error: registered supplier is required.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'resources', resource.id), resource), 1000);
      } catch (firestoreErr: any) {
        console.warn('POST resources: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryResources = memoryResources.filter(x => x.id !== resource.id);
      memoryResources.push(resource);
      res.status(201).json(resource);
    } catch (error: any) {
      console.error('REST createResource failed:', error);
      res.status(500).json({ error: 'Server failed to write resource record', details: error.message });
    }
  });

  // PUT: Update an existing resource item
  app.put('/api/resources/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const resource = req.body;

      if (resource.id && resource.id !== id) {
        return res.status(400).json({ error: 'Endpoint ID parameter does not match body payload ID.' });
      }
      resource.id = id;

      // Schema validation
      if (!resource.name || typeof resource.name !== 'string' || !resource.name.trim()) {
        return res.status(400).json({ error: 'Validation Error: Supply name is required.' });
      }
      if (!resource.category || typeof resource.category !== 'string') {
        return res.status(400).json({ error: 'Validation Error: Category is required.' });
      }
      if (typeof resource.stock !== 'number' || resource.stock < 0) {
        return res.status(400).json({ error: 'Validation Error: stock level must be zero or a positive number.' });
      }
      if (typeof resource.reserved !== 'number' || resource.reserved < 0) {
        return res.status(400).json({ error: 'Validation Error: reserved inventory cannot be negative.' });
      }
      if (typeof resource.delivered !== 'number' || resource.delivered < 0) {
        return res.status(400).json({ error: 'Validation Error: delivered count cannot be negative.' });
      }
      if (!resource.unit || typeof resource.unit !== 'string' || !resource.unit.trim()) {
        return res.status(400).json({ error: 'Validation Error: unit format is required.' });
      }
      if (!resource.warehouse || typeof resource.warehouse !== 'string' || !resource.warehouse.trim()) {
        return res.status(400).json({ error: 'Validation Error: storage warehouse name is required.' });
      }
      if (!resource.supplier || typeof resource.supplier !== 'string' || !resource.supplier.trim()) {
        return res.status(400).json({ error: 'Validation Error: registered supplier is required.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'resources', id), resource), 1000);
      } catch (firestoreErr: any) {
        console.warn('PUT resources: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryResources = memoryResources.filter(x => x.id !== id);
      memoryResources.push(resource);
      res.json(resource);
    } catch (error: any) {
      console.error('REST updateResource failed:', error);
      res.status(500).json({ error: 'Server failed to update resource record', details: error.message });
    }
  });

  // DELETE: Remove a resource
  app.delete('/api/resources/:id', async (req, res) => {
    try {
      const id = req.params.id;
      try {
        await withTimeout(deleteDoc(doc(db, 'resources', id)), 1000);
      } catch (firestoreErr: any) {
        console.warn('DELETE resources: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryResources = memoryResources.filter(x => x.id !== id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('REST deleteResource failed:', error);
      res.status(500).json({ error: 'Server failed to delete resource record', details: error.message });
    }
  });

  // ==========================================
  // RESOURCE REQUESTS REST ENDPOINTS
  // ==========================================

  // GET: Fetch all resource requests
  app.get('/api/requests', async (req, res) => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'requests')), 1000);
      const list: any[] = [];
      snap.forEach(d => list.push(d.data()));
      if (list.length > 0) {
        memoryRequests = list;
      }
      res.json(memoryRequests);
    } catch (error: any) {
      console.warn('REST getRequests failed/timed out, falling back to memory cache:', error.message);
      res.json(memoryRequests);
    }
  });

  // POST: Create a new resource request
  app.post('/api/requests', async (req, res) => {
    try {
      const request = req.body;

      // Schema validation
      if (!request.id) {
        return res.status(400).json({ error: 'Validation Error: Request identifier "id" is mandatory.' });
      }
      if (!request.shelterId || !request.shelterName) {
        return res.status(400).json({ error: 'Validation Error: "shelterId" and "shelterName" are required.' });
      }
      if (!Array.isArray(request.items) || request.items.length === 0) {
        return res.status(400).json({ error: 'Validation Error: "items" must be a non-empty array of items and quantities.' });
      }
      if (!request.priority || !['Critical', 'High', 'Medium', 'Low'].includes(request.priority)) {
        return res.status(400).json({ error: 'Validation Error: "priority" must be one of: Critical, High, Medium, Low.' });
      }
      if (!request.status || !['Pending', 'Approved', 'Assigned', 'In Transit', 'Delivered', 'Completed'].includes(request.status)) {
        return res.status(400).json({ error: 'Validation Error: "status" must be a valid state.' });
      }
      if (!request.date) {
        return res.status(400).json({ error: 'Validation Error: Requisition "date" is required.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'requests', request.id), request), 1000);
      } catch (firestoreErr: any) {
        console.warn('POST requests: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryRequests = memoryRequests.filter(x => x.id !== request.id);
      memoryRequests.push(request);
      res.status(201).json(request);
    } catch (error: any) {
      console.error('REST createRequest failed:', error);
      res.status(500).json({ error: 'Server failed to write resource request', details: error.message });
    }
  });

  // PUT: Update an existing resource request
  app.put('/api/requests/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const request = req.body;

      if (request.id && request.id !== id) {
        return res.status(400).json({ error: 'Endpoint ID parameter does not match body payload ID.' });
      }
      request.id = id;

      // Schema validation
      if (!request.shelterId || !request.shelterName) {
        return res.status(400).json({ error: 'Validation Error: "shelterId" and "shelterName" are required.' });
      }
      if (!Array.isArray(request.items) || request.items.length === 0) {
        return res.status(400).json({ error: 'Validation Error: "items" must be a non-empty array.' });
      }
      if (!request.priority || !['Critical', 'High', 'Medium', 'Low'].includes(request.priority)) {
        return res.status(400).json({ error: 'Validation Error: "priority" must be one of: Critical, High, Medium, Low.' });
      }
      if (!request.status || !['Pending', 'Approved', 'Assigned', 'In Transit', 'Delivered', 'Completed'].includes(request.status)) {
        return res.status(400).json({ error: 'Validation Error: "status" must be a valid state.' });
      }

      try {
        await withTimeout(setDoc(doc(db, 'requests', id), request), 1000);
      } catch (firestoreErr: any) {
        console.warn('PUT requests: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryRequests = memoryRequests.filter(x => x.id !== id);
      memoryRequests.push(request);
      res.json(request);
    } catch (error: any) {
      console.error('REST updateRequest failed:', error);
      res.status(500).json({ error: 'Server failed to update resource request', details: error.message });
    }
  });

  // DELETE: Remove a resource request
  app.delete('/api/requests/:id', async (req, res) => {
    try {
      const id = req.params.id;
      try {
        await withTimeout(deleteDoc(doc(db, 'requests', id)), 1000);
      } catch (firestoreErr: any) {
        console.warn('DELETE requests: Firestore timed out/failed. Saving to memory cache.', firestoreErr.message);
      }

      memoryRequests = memoryRequests.filter(x => x.id !== id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('REST deleteRequest failed:', error);
      res.status(500).json({ error: 'Server failed to delete resource request', details: error.message });
    }
  });

  // API Route: Gemini Resource Allocation Advisor
  app.post('/api/gemini/allocate', async (req, res) => {
    const { type, severity, location, affected, description } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fail-safe fallback if API key is not configured or fails
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY not configured. Generating realistic tactical relief proposal locally.');
      
      const factor = severity === 'Critical' ? 1.5 : severity === 'High' ? 1.2 : 0.8;
      const meals = Math.round(affected * 3 * factor);
      const water = Math.round(affected * 4 * factor);
      const kits = Math.round(affected * 0.05 * factor);
      const blankets = Math.round(affected * 0.4 * factor);

      return res.json({
        priority: severity === 'Critical' ? 'Critical' : 'High',
        recommendedMeals: meals,
        recommendedWaterLiters: water,
        recommendedMedicalKits: kits,
        recommendedBlankets: blankets,
        ngoActionPlan: `Mobilize key NGO hubs (Global Red Cross & Beacon Hope) to establish immediate food distribution corridors in ${location}. Coordinate logistics via standard regional supply channels.`,
        volunteerInstructions: `Deploy mobile teams for water delivery and blanket distribution. Clear access blockages with high-clearance vehicles. Priority remains elderly and pediatric sector evacuation support.`,
        riskWarning: `Monitor secondary hazard indexes: heavy precipitation models project potential flash floods or power grid failures in ${location} over the next 18 hours.`
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are an expert Enterprise Disaster Relief Logistics Advisor.
Analyze this active disaster and generate a tactical, data-driven, precise resource allocation recommendation blueprint.

Active Disaster Report:
- Type: ${type}
- Severity Level: ${severity}
- Location: ${location}
- Affected Population Size: ${affected} individuals
- Initial Observations: ${description}

Using established disaster-relief standards (Sphere Standards):
Generate:
1. Optimal volumes of meals, potable water liters, medical kits, and insulation blankets required for the immediate 48-hour response.
2. Recommended priority tier (Critical, High, Medium, Low).
3. Strategic action plan for coordinating NGOs.
4. Actionable task guidelines for mobile local volunteers.
5. Primary secondary risk vector to prepare for (weather changes, structural issues).

Return your response EXCLUSIVELY as a valid, single JSON object. Do not include markdown wraps or block indicators.
JSON Schema:
{
  "priority": "Critical" | "High" | "Medium" | "Low",
  "recommendedMeals": number,
  "recommendedWaterLiters": number,
  "recommendedMedicalKits": number,
  "recommendedBlankets": number,
  "ngoActionPlan": "detailed string",
  "volunteerInstructions": "detailed string",
  "riskWarning": "detailed string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Strip any accidental markdown formatting
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      res.json(result);
    } catch (error: any) {
      console.error('Gemini API call failed, using local calculations:', error);
      
      const meals = Math.round(affected * 3.5);
      const water = Math.round(affected * 4.5);
      res.json({
        priority: 'High',
        recommendedMeals: meals,
        recommendedWaterLiters: water,
        recommendedMedicalKits: Math.round(affected * 0.1),
        recommendedBlankets: Math.round(affected * 0.5),
        ngoActionPlan: 'Establish regional depots in secure elevated sectors. Initiate joint NGO deployment strategy.',
        volunteerInstructions: 'Report to local logistics depots for immediate supply chain packing and dispatch details.',
        riskWarning: 'Adverse weather conditions may delay initial air-support drops. Maintain ground vehicles readiness.'
      });
    }
  });

  // API Route: Gemini Disaster Progression Simulator
  app.post('/api/gemini/simulate-update', async (req, res) => {
    const { type, severity, location, description } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        projectedSeverity: severity === 'Critical' ? 'Critical' : 'High',
        next12HoursOutlook: `Atmospheric monitoring models indicate wind speeds of 45-55 knots with continuing intermittent downpours in ${location}. Inundation lines are projected to advance slowly, affecting lower elevation levels.`,
        criticalShortages: [
          'Emergency Trauma Kit Packs',
          'Heavy Machinery for Road Clearing',
          'Portable Water Purification Tablets'
        ],
        suggestedEmergencyTasks: [
          'Pre-position high-water clearance trucks near zone border coordinates.',
          'Broaden safety perimeter around compromised power line substations.',
          'Distribute supplementary blankets to temporary regional shelters.'
        ]
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a disaster projection simulator.
Analyze the current disaster state and project the realistic tactical development over the next 12 hours.

Disaster Information:
- Type: ${type}
- Severity: ${severity}
- Area: ${location}
- Description: ${description}

Project:
1. Expected changes in severity (Critical, High, Medium, Low).
2. A professional, clinical 3-sentence atmospheric/tactical outlook.
3. List of 3 critical supply categories that will experience severe shortages first.
4. List of 3 actionable emergency mitigation tasks for coordinators.

Return EXCLUSIVELY a JSON object matching this schema:
{
  "projectedSeverity": "Critical" | "High" | "Medium" | "Low",
  "next12HoursOutlook": "detailed outlook text",
  "criticalShortages": ["Shortage A", "Shortage B", "Shortage C"],
  "suggestedEmergencyTasks": ["Task A", "Task B", "Task C"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      res.json(result);
    } catch (error) {
      res.json({
        projectedSeverity: severity,
        next12HoursOutlook: `Unstable climatic currents are observed in ${location}. Shelter capacity is approaching maximum loads. Maintain primary emergency generator power loops.`,
        criticalShortages: ['Insulated Cots', 'General Pediatric Medicine', 'Clean Water Gallons'],
        suggestedEmergencyTasks: [
          'Inspect auxiliary power backups on critical shelter nodes.',
          'Deploy supplementary volunteer patrols for access route assessment.',
          'Consolidate regional medical supplies inside primary shelter facilities.'
        ]
      });
    }
  });

  // Vite Integration & SPA Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Dev Mode: Mounted Vite middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production Mode: Serving static client from dist/');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Disaster Resource Allocation server listening on http://localhost:${PORT}`);
  });
}

startServer();
