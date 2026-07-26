// src/modules/vacationRequests/logic.js
// Логіка роботи з заявками на відпустку

import { storage } from '../../core/storage.js';
import { ANNUAL_LIMIT_DAYS, REQUEST_STATUS } from './types.js';

const MODULE_ID = 'vacation-requests';
const CURRENT_YEAR = new Date().getFullYear();

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

export function getRequests() {
  return storage.get(MODULE_ID, 'requests') || [];
}

export function saveRequests(requests) {
  return storage.set(MODULE_ID, 'requests', requests);
}

export function createRequest(employeeName, start, end, comment = '') {
  const requests = getRequests();
  const newRequest = {
    id: generateId(),
    employeeName,
    start,
    end,
    comment,
    status: REQUEST_STATUS.PENDING,
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newRequest);
  saveRequests(requests);
  return newRequest;
}

export function updateRequestStatus(requestId, status) {
  const requests = getRequests();
  const request = requests.find(r => r.id === requestId);
  if (request) {
    request.status = status;
    saveRequests(requests);
  }
  return request;
}

export function getEmployeeRequests(employeeName) {
  return getRequests().filter(r => r.employeeName === employeeName);
}

export function getUsedDays(employeeName) {
  return getEmployeeRequests(employeeName)
    .filter(r => r.status === REQUEST_STATUS.APPROVED && new Date(r.start).getFullYear() === CURRENT_YEAR)
    .reduce((sum, r) => sum + daysBetween(r.start, r.end), 0);
}

export function getRemainingDays(employeeName) {
  return Math.max(0, ANNUAL_LIMIT_DAYS - getUsedDays(employeeName));
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
