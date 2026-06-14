"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoEmails, setDemoEmails] = useState([]);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDemoEmails(data.data.map((employee) => employee.email).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  async function loginWithCredentials(loginEmail, loginPassword) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await loginWithCredentials(email, password);
  }

  

  return (
    <main
      style={{
        minHeight: "calc(100vh - 90px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: 24,
      }}
    >
      <section
        style={{
          maxWidth: 460,
          width: "100%",
          background: "rgba(15, 23, 42, 0.98)",
          borderRadius: 28,
          boxShadow: "0 32px 90px rgba(15, 23, 42, 0.35)",
          padding: 36,
          border: "1px solid rgba(148, 163, 184, 0.15)",
        }}
      >
        <div style={{ marginBottom: 30 }}>
          <p style={{ margin: 0, color: '#38bdf8', fontWeight: 700 }}>Welcome back</p>
          <h1 style={{ margin: '10px 0 0', fontSize: '2rem', color: '#fff' }}>
            Login to your dashboard
          </h1>
          <p style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
            Enter your credentials to access tasks, employees, and dashboard features.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#cbd5e1', fontWeight: 600 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: '#0f172a',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#cbd5e1', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: '#0f172a',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: '#0ea5e9',
              color: '#0f172a',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p style={{ marginTop: '15px', color: '#fff' }}>
  Don't have an account? <a href="/register" style={{ color: '#00bcd4' }}>Sign Up here</a>
</p>
         
        </form>



        {error && (
          <div style={{ marginTop: 22, padding: 14, borderRadius: 14, background: '#7f1d1d', color: '#fee2e2' }}>
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
