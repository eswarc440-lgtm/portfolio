/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityLog } from '../types';
import { DisasterDBServ } from '../firebase';

export interface AuditTrailFilters {
  searchQuery: string;
  role: string;
  actionType: string;
  startDate: string;
  endDate: string;
}

export const useAuditTrail = () => {
  const { currentUser, activityLogs, logActivity } = useApp();
  const [isLogging, setIsLogging] = useState(false);

  /**
   * Core logging method with optional metadata tracking
   */
  const logAction = useCallback(async (action: string, details: string, category?: string) => {
    setIsLogging(true);
    try {
      const enrichedDetails = category ? `[${category}] ${details}` : details;
      
      // Let the main application context handle the logging to sync the React state instantly
      await logActivity(action, enrichedDetails);
    } catch (error) {
      console.error('Failed to write audit trail log:', error);
    } finally {
      setIsLogging(false);
    }
  }, [logActivity]);

  /**
   * Helper to log disaster events
   */
  const logDisasterAction = useCallback(async (disasterTitle: string, actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SIMULATE', details: string) => {
    const action = `Disaster ${actionType.charAt(0) + actionType.slice(1).toLowerCase()}`;
    const desc = `Disaster: "${disasterTitle}" | ${details}`;
    await logAction(action, desc, 'DISASTER');
  }, [logAction]);

  /**
   * Helper to log resource requests & allocations
   */
  const logResourceRequestAction = useCallback(async (shelterName: string, actionType: 'CREATE' | 'APPROVE' | 'COMPLETED', itemsSummary: string, priority: string) => {
    const action = `Resource Request ${actionType.charAt(0) + actionType.slice(1).toLowerCase()}`;
    const desc = `Shelter: "${shelterName}" | Items: [${itemsSummary}] | Priority: ${priority}`;
    await logAction(action, desc, 'RESOURCE_REQUEST');
  }, [logAction]);

  /**
   * Helper to log logistics delivery events
   */
  const logDeliveryAction = useCallback(async (deliveryId: string, status: string, volunteerName: string, note?: string) => {
    const action = 'Delivery Dispatch/Update';
    const desc = `Delivery ID: ${deliveryId} | Status: ${status} | Assigned to: ${volunteerName}${note ? ` | Note: ${note}` : ''}`;
    await logAction(action, desc, 'DELIVERY');
  }, [logAction]);

  /**
   * Helper to log shelter management actions
   */
  const logShelterAction = useCallback(async (shelterName: string, actionType: 'CREATE' | 'UPDATE' | 'DELETE', occupancyInfo: string) => {
    const action = `Shelter ${actionType.charAt(0) + actionType.slice(1).toLowerCase()}`;
    const desc = `Shelter: "${shelterName}" | Occupancy stats: ${occupancyInfo}`;
    await logAction(action, desc, 'SHELTER');
  }, [logAction]);

  /**
   * Helper to log configuration and security audit events
   */
  const logSecurityAction = useCallback(async (securityFeature: string, details: string) => {
    await logAction('Security / Config Change', `Feature: "${securityFeature}" | ${details}`, 'SECURITY');
  }, [logAction]);

  /**
   * Filter and search logs
   */
  const filterLogs = useCallback((filters: AuditTrailFilters): ActivityLog[] => {
    if (!activityLogs) return [];

    return activityLogs.filter(log => {
      // 1. Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesUser = log.userName.toLowerCase().includes(query);
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        const matchesRole = log.role.toLowerCase().includes(query);
        if (!matchesUser && !matchesAction && !matchesDetails && !matchesRole) {
          return false;
        }
      }

      // 2. Role Filter
      if (filters.role && filters.role !== 'All Roles') {
        if (log.role.toLowerCase() !== filters.role.toLowerCase()) {
          return false;
        }
      }

      // 3. Action Type/Category Filter
      if (filters.actionType && filters.actionType !== 'All Categories') {
        const cat = filters.actionType.toUpperCase();
        if (cat === 'SECURITY' && !log.action.includes('Security') && !log.details.includes('[SECURITY]')) return false;
        if (cat === 'DISASTER' && !log.action.includes('Disaster') && !log.details.includes('[DISASTER]')) return false;
        if (cat === 'RESOURCE_REQUEST' && !log.action.includes('Request') && !log.details.includes('[RESOURCE_REQUEST]')) return false;
        if (cat === 'DELIVERY' && !log.action.includes('Delivery') && !log.details.includes('[DELIVERY]')) return false;
        if (cat === 'SHELTER' && !log.action.includes('Shelter') && !log.details.includes('[SHELTER]')) return false;
        if (cat === 'AUTH' && !log.action.includes('Login') && !log.action.includes('Logout') && !log.action.includes('Register')) return false;
      }

      // 4. Date range filters
      if (log.timestamp) {
        const logDate = log.timestamp.split(' ')[0]; // yyyy-mm-dd
        if (filters.startDate && logDate < filters.startDate) {
          return false;
        }
        if (filters.endDate && logDate > filters.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [activityLogs]);

  /**
   * Export function to generate formatted CSV download of audit log trail
   */
  const exportLogsToCSV = useCallback((filteredLogs: ActivityLog[]) => {
    try {
      const headers = ['Log ID', 'Timestamp', 'User ID', 'User Name', 'Role', 'Action', 'Details'];
      const rows = filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.userId,
        `"${log.userName.replace(/"/g, '""')}"`,
        log.role,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `smart_disaster_audit_trail_${new Date().toISOString().substring(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate CSV export:', error);
    }
  }, []);

  return {
    currentUser,
    activityLogs,
    isLogging,
    logAction,
    logDisasterAction,
    logResourceRequestAction,
    logDeliveryAction,
    logShelterAction,
    logSecurityAction,
    filterLogs,
    exportLogsToCSV
  };
};
