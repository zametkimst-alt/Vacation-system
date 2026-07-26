// src/modules/vacationRequests/components.jsx
// React компоненти модуля заявок на відпустку

import { useState, useEffect } from 'react';
import { i18n } from '../../core/i18n.js';
import { auth } from '../../core/auth.js';
import {
  getRequests,
  createRequest,
  updateRequestStatus,
  getEmployeeRequests,
  getRemainingDays,
  daysBetween,
  formatDate,
} from './logic.js';
import { REQUEST_STATUS, STATUS_META } from './types.js';

export function EmployeePanel({ employee }) {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ start: '', end: '', comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  function loadRequests() {
    setRequests(getEmployeeRequests(employee.name));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (!form.start || !form.end) {
      setMessage('Заповни обидві дати');
      return;
    }

    if (new Date(form.end) < new Date(form.start)) {
      setMessage('Дата кінця не може бути раніше дати початку');
      return;
    }

    createRequest(employee.name, form.start, form.end, form.comment);
    setForm({ start: '', end: '', comment: '' });
    setMessage('Заявку подано');
    loadRequests();
  }

  const remaining = getRemainingDays(employee.name);
  const used = 20 - remaining;

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 20px' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          {i18n.t('vacation.title')}
        </h1>
      </div>

      {/* Статус днів */}
      <div
        style={{
          padding: '18px 20px',
          marginBottom: '16px',
          background: '#FFFFFF',
          border: '1px solid #E4E0D6',
          borderRadius: '10px',
        }}
      >
        <div style={{ fontSize: '13px', color: '#7A7669' }}>
          {employee.name} · {new Date().getFullYear()}
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>
          {remaining} з 20 днів
        </div>
      </div>

      {/* Прогрес-бар */}
      <div
        style={{
          height: '6px',
          borderRadius: '999px',
          background: '#EDEAE0',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(used / 20) * 100}%`,
            background: '#3B5D52',
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Форма нової заявки */}
      <div
        style={{
          padding: '20px',
          marginBottom: '24px',
          background: '#FFFFFF',
          border: '1px solid #E4E0D6',
          borderRadius: '10px',
        }}
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
          {i18n.t('vacation.newRequest')}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7A7669', marginBottom: '5px' }}>
                {i18n.t('vacation.from')}
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #DDD8CB',
                  borderRadius: '7px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7A7669', marginBottom: '5px' }}>
                {i18n.t('vacation.to')}
              </label>
              <input
                type="date"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #DDD8CB',
                  borderRadius: '7px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '12px', color: '#7A7669', marginBottom: '5px' }}>
            {i18n.t('vacation.comment')}
          </label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #DDD8CB',
              borderRadius: '7px',
              fontSize: '14px',
              minHeight: '60px',
              resize: 'vertical',
              marginBottom: '14px',
            }}
          />

          {form.start && form.end && new Date(form.end) >= new Date(form.start) && (
            <div style={{ fontSize: '13px', color: '#7A7669', marginBottom: '14px' }}>
              {daysBetween(form.start, form.end)} {i18n.t('vacation.days')}
            </div>
          )}

          {message && (
            <div style={{ fontSize: '13px', color: '#3B5D52', marginBottom: '12px' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#3B5D52',
              color: '#F5F3EE',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {i18n.t('common.submit')}
          </button>
        </form>
      </div>

      {/* Список заявок */}
      <h2 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
        {i18n.t('vacation.myRequests')}
      </h2>
      {requests.length === 0 ? (
        <p style={{ color: '#7A7669', fontSize: '13px' }}>Заявок поки немає</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  function loadRequests() {
    const allRequests = getRequests();
    setRequests(allRequests);
  }

  function handleStatusChange(id, status) {
    updateRequestStatus(id, status);
    loadRequests();
  }

  const filtered =
    filter === 'all'
      ? requests
      : requests.filter((r) => r.status === filter);

  const pendingCount = requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 20px' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          {i18n.t('auth.adminPanel')}
        </h1>
        {pendingCount > 0 && (
          <div style={{ fontSize: '13px', color: '#7A7669', marginTop: '3px' }}>
            {pendingCount} заявок очікує
          </div>
        )}
      </div>

      {/* Фільтри */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {[
          ['pending', 'Очікують'],
          ['approved', 'Схвалені'],
          ['rejected', 'Відхилені'],
          ['all', 'Усі'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              border: '1px solid #DDD8CB',
              background: filter === key ? '#3B5D52' : '#fff',
              color: filter === key ? '#F5F3EE' : '#2B2A28',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Список заявок */}
      {filtered.length === 0 ? (
        <p style={{ color: '#7A7669', fontSize: '13px' }}>Немає заявок</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((r) => (
            <AdminRequestCard
              key={r.id}
              request={r}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }) {
  const meta = STATUS_META[request.status];
  return (
    <div
      style={{
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '1px solid #E4E0D6',
        borderRadius: '10px',
      }}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>
          {formatDate(request.start)} – {formatDate(request.end)}
        </div>
        <div style={{ fontSize: '12px', color: '#7A7669', marginTop: '2px' }}>
          {daysBetween(request.start, request.end)} {i18n.t('vacation.days')}
          {request.comment && ` · ${request.comment}`}
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>
  );
}

function AdminRequestCard({ request, onStatusChange }) {
  const meta = STATUS_META[request.status];
  return (
    <div
      style={{
        padding: '16px 18px',
        background: '#FFFFFF',
        border: '1px solid #E4E0D6',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>{request.employeeName}</div>
          <div style={{ fontSize: '13px', color: '#7A7669', marginTop: '2px' }}>
            {formatDate(request.start)} – {formatDate(request.end)} · {daysBetween(request.start, request.end)} {i18n.t('vacation.days')}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {request.comment && (
        <div style={{ fontSize: '13px', color: '#4A4740', marginBottom: '10px' }}>
          «{request.comment}»
        </div>
      )}

      {request.status === REQUEST_STATUS.PENDING && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => onStatusChange(request.id, REQUEST_STATUS.APPROVED)}
            style={{
              flex: 1,
              padding: '9px',
              background: '#3F8F6B',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {i18n.t('vacation.approve')}
          </button>
          <button
            onClick={() => onStatusChange(request.id, REQUEST_STATUS.REJECTED)}
            style={{
              flex: 1,
              padding: '9px',
              background: '#fff',
              color: '#C1594A',
              border: '1px solid #E3B3AA',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {i18n.t('vacation.reject')}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        background: meta.bg,
        color: meta.text,
        fontSize: '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: meta.dot,
        }}
      />
      {meta.label}
    </span>
  );
}
