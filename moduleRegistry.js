// src/core/moduleRegistry.js
// Реєстр модулів платформи — вказує, які модулі завантажувати

import VacationRequestsModule from '../modules/vacationRequests/index.js';

export const MODULE_REGISTRY = [
  {
    id: 'vacation-requests',
    name: 'Заявки на відпустку',
    nameEn: 'Vacation Requests',
    namePl: 'Wnioski o urlop',
    module: VacationRequestsModule,
    enabled: true,
  },
  // Наступні модулі додаватимемо сюди
];

export function getEnabledModules() {
  return MODULE_REGISTRY.filter(m => m.enabled).map(m => m.module);
}
