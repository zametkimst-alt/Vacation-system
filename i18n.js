// src/core/i18n.js
// Система локалізації — підтримка української та польської

const translations = {
  uk: {
    // Common
    'common.login': 'Увійти',
    'common.logout': 'Вийти',
    'common.submit': 'Подати',
    'common.cancel': 'Скасувати',
    'common.edit': 'Редагувати',
    'common.delete': 'Видалити',
    'common.add': 'Додати',
    'common.save': 'Зберегти',
    'common.close': 'Закрити',
    'common.back': 'Назад',
    'common.error': 'Помилка',
    'common.success': 'Успіх',

    // Auth
    'auth.title': 'Заявки на відпустку',
    'auth.enterPin': 'Введи PIN-код для входу',
    'auth.invalidPin': 'Невірний PIN-код',
    'auth.adminPanel': 'Панель керівника',

    // Vacation module
    'vacation.title': 'Моя відпустка',
    'vacation.newRequest': 'Нова заявка',
    'vacation.myRequests': 'Мої заявки',
    'vacation.from': 'З',
    'vacation.to': 'По',
    'vacation.comment': 'Коментар',
    'vacation.days': 'днів',
    'vacation.approve': '✓ Схвалити',
    'vacation.reject': '✕ Відхилити',
    'vacation.pending': 'Очікує',
    'vacation.approved': 'Схвалено',
    'vacation.rejected': 'Відхилено',
    'vacation.remaining': 'днів лишилось',
  },
  pl: {
    // Common
    'common.login': 'Zaloguj się',
    'common.logout': 'Wyloguj się',
    'common.submit': 'Prześlij',
    'common.cancel': 'Anuluj',
    'common.edit': 'Edytuj',
    'common.delete': 'Usuń',
    'common.add': 'Dodaj',
    'common.save': 'Zapisz',
    'common.close': 'Zamknij',
    'common.back': 'Wstecz',
    'common.error': 'Błąd',
    'common.success': 'Sukces',

    // Auth
    'auth.title': 'Wnioski o urlop',
    'auth.enterPin': 'Wpisz kod PIN, aby się zalogować',
    'auth.invalidPin': 'Nieprawidłowy kod PIN',
    'auth.adminPanel': 'Panel administratora',

    // Vacation module
    'vacation.title': 'Mój urlop',
    'vacation.newRequest': 'Nowy wniosek',
    'vacation.myRequests': 'Moje wnioski',
    'vacation.from': 'Od',
    'vacation.to': 'Do',
    'vacation.comment': 'Komentarz',
    'vacation.days': 'dni',
    'vacation.approve': '✓ Zatwierdź',
    'vacation.reject': '✕ Odrzuć',
    'vacation.pending': 'Oczekuje',
    'vacation.approved': 'Zatwierdzone',
    'vacation.rejected': 'Odrzucone',
    'vacation.remaining': 'dni pozostałych',
  },
};

export class I18n {
  constructor(defaultLang = 'uk') {
    this.currentLang = defaultLang;
    this.loadLanguage();
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('platform-lang', lang);
    }
  }

  loadLanguage() {
    const saved = localStorage.getItem('platform-lang');
    if (saved && translations[saved]) {
      this.currentLang = saved;
    }
  }

  t(key, defaultText = key) {
    return translations[this.currentLang]?.[key] || defaultText;
  }

  getCurrentLang() {
    return this.currentLang;
  }

  getAvailableLanguages() {
    return Object.keys(translations);
  }
}

export const i18n = new I18n();
