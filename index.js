// src/modules/vacationRequests/index.js
// Точка входу модуля заявок на відпустку

import { EmployeePanel, AdminPanel } from './components.jsx';

export default {
  id: 'vacation-requests',
  name: 'Заявки на відпустку',
  
  // Компоненти для панелей
  EmployeePanel,
  AdminPanel,
  
  // Логіка модуля експортується окремо
  // для використання в інших місцях
};
