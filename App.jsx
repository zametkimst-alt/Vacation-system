import { useState, useEffect } from 'react';
import { auth } from './core/auth.js';
import { i18n } from './core/i18n.js';
import VacationModule from './modules/vacationRequests/index.js';

export default function App() {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [language, setLanguage] = useState(i18n.getCurrentLang());

  function handlePinSubmit(e) {
    e.preventDefault();
    const cleaned = pinInput.trim();
    setPinError('');

    if (auth.loginAdmin(cleaned)) {
      setPinInput('');
      return;
    }

    if (auth.loginEmployee(cleaned)) {
      setPinInput('');
      return;
    }

    setPinError(i18n.t('auth.invalidPin'));
  }

  function handleLogout() {
    auth.logout();
    setPinInput('');
    setPinError('');
  }

  function handleLanguageChange(lang) {
    i18n.setLanguage(lang);
    setLanguage(lang);
  }

  const user = auth.getCurrentUser();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          {i18n.getAvailableLanguages().map((lang) => (
            <button key={lang} onClick={() => handleLanguageChange(lang)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #DDD8CB', background: language === lang ? '#3B5D52' : '#fff', color: language === lang ? '#F5F3EE' : '#2B2A28', fontSize: '12px', fontWeight: 600 }}>
              {lang === 'uk' ? '🇺🇦' : '🇵🇱'}
            </button>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: '340px', padding: '32px 28px', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E4E0D6', borderRadius: '10px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#3B5D52', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F3EE', fontSize: '20px' }}>✓</div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{i18n.t('auth.title')}</h1>
          <p style={{ fontSize: '13px', color: '#7A7669', margin: '0 0 22px' }}>{i18n.t('auth.enterPin')}</p>
          <form onSubmit={handlePinSubmit}>
            <input type="text" inputMode="numeric" autoComplete="off" value={pinInput} onChange={(e) => setPinInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit(e); }} placeholder="• • • •" autoFocus style={{ width: '100%', padding: '12px 14px', fontSize: '20px', letterSpacing: '6px', textAlign: 'center', border: '1px solid #DDD8CB', borderRadius: '8px', marginBottom: '12px' }} />
            {pinError && <div style={{ color: '#9B4030', fontSize: '13px', marginBottom: '12px' }}>{pinError}</div>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#3B5D52', color: '#F5F3EE', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>{i18n.t('common.login')}</button>
          </form>
        </div>
      </div>
    );
  }

  if (user.role === 'employee') {
    return (
      <div style={{ background: '#F5F3EE', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '16px 20px', background: '#FFFFFF', borderBottom: '1px solid #E4E0D6' }}>
          {i18n.getAvailableLanguages().map((lang) => (
            <button key={lang} onClick={() => handleLanguageChange(lang)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #DDD8CB', background: language === lang ? '#3B5D52' : '#fff', color: language === lang ? '#F5F3EE' : '#2B2A28', fontSize: '12px' }}>
              {lang === 'uk' ? '🇺🇦' : '🇵🇱'}
            </button>
          ))}
          <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DDD8CB', background: '#fff', color: '#7A7669', fontSize: '12px', fontWeight: 600 }}>{i18n.t('common.logout')}</button>
        </div>
        <VacationModule.EmployeePanel employee={user} />
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div style={{ background: '#F5F3EE', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '16px 20px', background: '#FFFFFF', borderBottom: '1px solid #E4E0D6' }}>
          {i18n.getAvailableLanguages().map((lang) => (
            <button key={lang} onClick={() => handleLanguageChange(lang)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #DDD8CB', background: language === lang ? '#3B5D52' : '#fff', color: language === lang ? '#F5F3EE' : '#2B2A28', fontSize: '12px' }}>
              {lang === 'uk' ? '🇺🇦' : '🇵🇱'}
            </button>
          ))}
          <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #DDD8CB', background: '#fff', color: '#7A7669', fontSize: '12px', fontWeight: 600 }}>{i18n.t('common.logout')}</button>
        </div>
        <VacationModule.AdminPanel />
      </div>
    );
  }
}
