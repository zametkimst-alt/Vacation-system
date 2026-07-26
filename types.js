// src/modules/vacationRequests/types.js
// Типи й константи для модуля заявок на відпустку

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const STATUS_META = {
  [REQUEST_STATUS.PENDING]: {
    label: 'Очікує',
    labelPl: 'Oczekuje',
    dot: '#D4A24C',
    bg: '#FBF3E3',
    text: '#8A6A1E',
  },
  [REQUEST_STATUS.APPROVED]: {
    label: 'Схвалено',
    labelPl: 'Zatwierdzone',
    dot: '#3F8F6B',
    bg: '#E8F5EF',
    text: '#2C6B4F',
  },
  [REQUEST_STATUS.REJECTED]: {
    label: 'Відхилено',
    labelPl: 'Odrzucone',
    dot: '#C1594A',
    bg: '#FBEAE7',
    text: '#9B4030',
  },
};

export const ANNUAL_LIMIT_DAYS = 20;
