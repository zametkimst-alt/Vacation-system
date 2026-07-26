// src/core/auth.js
// Система авторизації платформи

import { storage } from './storage.js';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.adminPin = '8127';
    this.moduleId = 'core-auth';
  }

  setAdminPin(pin) {
    this.adminPin = pin;
  }

  registerEmployee(name, pin) {
    const employees = this.getEmployees();
    if (employees.find(e => e.pin === pin)) {
      throw new Error('PIN вже використовується');
    }
    const emp = { id: Date.now().toString(), name, pin };
    employees.push(emp);
    storage.set(this.moduleId, 'employees', employees);
    return emp;
  }

  getEmployees() {
    return storage.get(this.moduleId, 'employees') || [];
  }

  deleteEmployee(id) {
    const employees = this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    storage.set(this.moduleId, 'employees', filtered);
  }

  updateEmployee(id, name, pin) {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === id);
    if (emp) {
      emp.name = name;
      emp.pin = pin;
      storage.set(this.moduleId, 'employees', employees);
    }
  }

  loginEmployee(pin) {
    const emp = this.getEmployees().find(e => e.pin === pin);
    if (emp) {
      this.currentUser = { id: emp.id, name: emp.name, role: 'employee' };
      return this.currentUser;
    }
    return null;
  }

  loginAdmin(pin) {
    if (pin === this.adminPin) {
      this.currentUser = { role: 'admin' };
      return this.currentUser;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  isEmployee() {
    return this.currentUser?.role === 'employee';
  }
}

export const auth = new AuthManager();
