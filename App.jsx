import { useState, useEffect, useCallback } from "react";

const ADMIN_PIN = "8127";
const ANNUAL_LIMIT_DAYS = 20;
const CURRENT_YEAR = new Date().getFullYear();

const STATUS_META = {
  pending: { label: "Очікує", dot: "#D4A24C", bg: "#FBF3E3", text: "#8A6A1E" },
  approved: { label: "Схвалено", dot: "#3F8F6B", bg: "#E8F5EF", text: "#2C6B4F" },
  rejected: { label: "Відхилено", dot: "#C1594A", bg: "#FBEAE7", text: "#9B4030" },
};

// Дефолтні працівники з PIN-кодами (потім можна редагувати)
const DEFAULT_EMPLOYEES = [
  { name: "Петро", pin: "1111" },
  { name: "Марія", pin: "2222" },
  { name: "Іван", pin: "3333" },
];

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [role, setRole] = useState(null); // 'employee' | 'admin' | null
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [form, setForm] = useState({ start: "", end: "", comment: "" });
  const [submitMsg, setSubmitMsg] = useState("");
  const [adminFilter, setAdminFilter] = useState("pending");

  const [nameDraft, setNameDraft] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);

  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem("vacation-requests");
      const savedEmps = localStorage.getItem("vacation-employees");
      setRequests(saved ? JSON.parse(saved) : []);
      if (savedEmps) setEmployees(JSON.parse(savedEmps));
    } catch (e) {
      console.error("Load error:", e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      loadData();
      setLoading(false);
    })();
  }, [loadData]);

  async function saveRequests(next) {
    setRequests(next);
    try {
      localStorage.setItem("vacation-requests", JSON.stringify(next));
    } catch (e) {
      setError("Помилка збереження.");
    }
  }

  function handlePinSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const cleaned = pinInput.trim();

    if (cleaned === ADMIN_PIN) {
      setRole("admin");
      setPinError("");
      setPinInput("");
      return;
    }

    const emp = employees.find((e) => e.pin === cleaned);
    if (emp) {
      setCurrentEmployee(emp);
      setRole("employee");
      setNameConfirmed(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Невірний PIN-код");
    }
  }

  function usedDaysFor(name) {
    return requests
      .filter(
        (r) =>
          r.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          r.status === "approved" &&
          new Date(r.start).getFullYear() === CURRENT_YEAR
      )
      .reduce((sum, r) => sum + daysBetween(r.start, r.end), 0);
  }

  async function handleSubmitRequest(e) {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitMsg("");

    if (!currentEmployee) {
      setSubmitMsg("Помилка: працівник не визначен.");
      return;
    }

    if (!form.start || !form.end) {
      setSubmitMsg("Заповни обидві дати.");
      return;
    }

    if (new Date(form.end) < new Date(form.start)) {
      setSubmitMsg("Дата кінця не може бути раніше дати початку.");
      return;
    }

    const newReq = {
      id: uid(),
      name: currentEmployee.name,
      start: form.start,
      end: form.end,
      comment: form.comment.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await saveRequests([newReq, ...requests]);
    setForm({ start: "", end: "", comment: "" });
    setSubmitMsg("Заявку подано.");
  }

  async function updateStatus(id, status) {
    const next = requests.map((r) => (r.id === id ? { ...r, status } : r));
    await saveRequests(next);
  }

  const remaining = currentEmployee
    ? ANNUAL_LIMIT_DAYS - usedDaysFor(currentEmployee.name)
    : ANNUAL_LIMIT_DAYS;

  const myRequests = currentEmployee
    ? requests.filter((r) => r.name === currentEmployee.name)
    : [];

  const filteredAdminRequests =
    adminFilter === "all"
      ? requests
      : requests.filter((r) => r.status === adminFilter);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F5F3EE",
        color: "#2B2A28",
        padding: "0",
      }}
    >
      {role === null && (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "340px",
              padding: "32px 28px",
              textAlign: "center",
              background: "#FFFFFF",
              border: "1px solid #E4E0D6",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "#3B5D52",
                margin: "0 auto 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F5F3EE",
                fontSize: "20px",
              }}
            >
              ✓
            </div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 4px",
                letterSpacing: "-0.01em",
              }}
            >
              Заявки на відпустку
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#7A7669",
                margin: "0 0 22px",
              }}
            >
              Введи PIN-код для входу
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePinSubmit();
              }}
              placeholder="• • • •"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "20px",
                letterSpacing: "6px",
                textAlign: "center",
                border: "1px solid #DDD8CB",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            />
            {pinError && (
              <div style={{ color: "#9B4030", fontSize: "13px", marginBottom: "12px" }}>
                {pinError}
              </div>
            )}
            <button
              type="button"
              onClick={() => handlePinSubmit()}
              style={{
                width: "100%",
                padding: "12px",
                background: "#3B5D52",
                color: "#F5F3EE",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Увійти
            </button>
          </div>
        </div>
      )}

      {role === "employee" && currentEmployee && (
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "28px 20px" }}>
          <Header title="Моя відпустка" onLogout={() => {
            setRole(null);
            setCurrentEmployee(null);
            setNameConfirmed(false);
          }} />

          <div
            className="card"
            style={{
              padding: "18px 20px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FFFFFF",
              border: "1px solid #E4E0D6",
              borderRadius: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", color: "#7A7669" }}>
                {currentEmployee.name} · {CURRENT_YEAR}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "2px" }}>
                {Math.max(remaining, 0)} з {ANNUAL_LIMIT_DAYS} днів
              </div>
            </div>
          </div>

          <div
            style={{
              height: "6px",
              borderRadius: "999px",
              background: "#EDEAE0",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(
                  100,
                  (usedDaysFor(currentEmployee.name) / ANNUAL_LIMIT_DAYS) * 100
                )}%`,
                background: "#3B5D52",
                transition: "width 0.3s",
              }}
            />
          </div>

          <div
            className="card"
            style={{
              padding: "20px",
              marginBottom: "24px",
              background: "#FFFFFF",
              border: "1px solid #E4E0D6",
              borderRadius: "10px",
            }}
          >
            <h2 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 12px", color: "#2B2A28" }}>
              Нова заявка
            </h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", color: "#7A7669", marginBottom: "5px", fontWeight: 500 }}>З</label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #DDD8CB",
                    borderRadius: "7px",
                    fontSize: "14px",
                    background: "#FCFBF8",
                  }}
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", color: "#7A7669", marginBottom: "5px", fontWeight: 500 }}>По</label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #DDD8CB",
                    borderRadius: "7px",
                    fontSize: "14px",
                    background: "#FCFBF8",
                  }}
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                />
              </div>
            </div>
            <label style={{ display: "block", fontSize: "12px", color: "#7A7669", marginBottom: "5px", fontWeight: 500 }}>Коментар (необов'язково)</label>
            <textarea
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #DDD8CB",
                borderRadius: "7px",
                fontSize: "14px",
                background: "#FCFBF8",
                minHeight: "60px",
                resize: "vertical",
                marginBottom: "14px",
              }}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Напр. родинна подія"
            />
            {form.start && form.end && new Date(form.end) >= new Date(form.start) && (
              <div style={{ fontSize: "13px", color: "#7A7669", marginBottom: "14px" }}>
                Триватиме {daysBetween(form.start, form.end)} дн.
              </div>
            )}
            {submitMsg && (
              <div style={{ fontSize: "13px", color: "#3B5D52", marginBottom: "12px" }}>
                {submitMsg}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmitRequest}
              style={{
                width: "100%",
                padding: "12px",
                background: "#3B5D52",
                color: "#F5F3EE",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Подати заявку
            </button>
          </div>

          <h2 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 12px", color: "#2B2A28" }}>
            Мої заявки
          </h2>
          {loading ? (
            <p style={{ color: "#7A7669", fontSize: "13px" }}>Завантаження…</p>
          ) : myRequests.length === 0 ? (
            <p style={{ color: "#7A7669", fontSize: "13px" }}>Заявок поки немає.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myRequests.map((r) => (
                <RequestRow key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {role === "admin" && (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "28px 20px" }}>
          <Header
            title="Панель керівника"
            subtitle={
              pendingCount > 0
                ? `${pendingCount} заявок очікує рішення`
                : "Немає заявок, що очікують"
            }
            onLogout={() => setRole(null)}
          />

          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            {[
              ["pending", "Очікують"],
              ["approved", "Схвалені"],
              ["rejected", "Відхилені"],
              ["all", "Усі"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setAdminFilter(key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  border: "1px solid #DDD8CB",
                  background: adminFilter === key ? "#3B5D52" : "#fff",
                  color: adminFilter === key ? "#F5F3EE" : "#2B2A28",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: "#7A7669", fontSize: "13px" }}>Завантаження…</p>
          ) : filteredAdminRequests.length === 0 ? (
            <p style={{ color: "#7A7669", fontSize: "13px" }}>Немає заявок у цій категорії.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredAdminRequests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "16px 18px",
                    background: "#FFFFFF",
                    border: "1px solid #E4E0D6",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{r.name}</div>
                      <div style={{ fontSize: "13px", color: "#7A7669", marginTop: "2px" }}>
                        {formatDate(r.start)} – {formatDate(r.end)} · {daysBetween(r.start, r.end)} дн.
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: "13px", color: "#4A4740", marginBottom: "10px" }}>
                      «{r.comment}»
                    </div>
                  )}
                  {r.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        style={{
                          flex: 1,
                          padding: "9px",
                          background: "#3F8F6B",
                          color: "#fff",
                          border: "none",
                          borderRadius: "7px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Схвалити
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "rejected")}
                        style={{
                          flex: 1,
                          padding: "9px",
                          background: "#fff",
                          color: "#C1594A",
                          border: "1px solid #E3B3AA",
                          borderRadius: "7px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        ✕ Відхилити
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#C1594A",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function Header({ title, subtitle, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "22px",
      }}
    >
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: "13px", color: "#7A7669", marginTop: "3px" }}>
            {subtitle}
          </div>
        )}
      </div>
      <button
        onClick={onLogout}
        style={{
          background: "none",
          border: "1px solid #DDD8CB",
          borderRadius: "7px",
          padding: "7px 12px",
          fontSize: "12px",
          color: "#7A7669",
        }}
      >
        Вийти
      </button>
    </div>
  );
}

function RequestRow({ r }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#FFFFFF",
        border: "1px solid #E4E0D6",
        borderRadius: "10px",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>
          {formatDate(r.start)} – {formatDate(r.end)}
        </div>
        <div style={{ fontSize: "12px", color: "#7A7669", marginTop: "2px" }}>
          {daysBetween(r.start, r.end)} дн.{r.comment ? ` · ${r.comment}` : ""}
        </div>
      </div>
      <StatusBadge status={r.status} />
    </div>
  );
}

function StatusBadge({ status }) {
  const STATUS_META_INNER = {
    pending: { label: "Очікує", dot: "#D4A24C", bg: "#FBF3E3", text: "#8A6A1E" },
    approved: { label: "Схвалено", dot: "#3F8F6B", bg: "#E8F5EF", text: "#2C6B4F" },
    rejected: { label: "Відхилено", dot: "#C1594A", bg: "#FBEAE7", text: "#9B4030" },
  };
  const meta = STATUS_META_INNER[status] || STATUS_META_INNER.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        background: meta.bg,
        color: meta.text,
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: meta.dot,
        }}
      />
      {meta.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
