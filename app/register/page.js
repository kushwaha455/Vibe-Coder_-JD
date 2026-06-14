"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Yeh request seedhe hamari register API par jayegi
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account successfully ban gaya! Ab login karein.");
        window.location.href = "/login"; // Sahi hone par login page par bhej dega
      } else {
        alert(data.message || "Registration fail ho gaya!");
      }
    } catch (error) {
      alert("Koi error aaya: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center", 
      minHeight: "100vh", backgroundColor: "#0f172a", color: "#fff"
    }}>
      <form onSubmit={handleSignUp} style={{
        background: "#1e293b", padding: "40px", borderRadius: "8px", 
        width: "100%", maxWidth: "400px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Create Account</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "none", color: "#000" }} />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "none", color: "#000" }} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "none", color: "#000" }} />
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "12px", background: "#00bcd4", color: "#fff", 
          border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
        }}>
          {loading ? "CREATING..." : "SIGN UP"}
        </button>

        <p style={{ marginTop: "15px", textAlign: "center", color: "#94a3b8" }}>
          Already have an account? <a href="/login" style={{ color: "#00bcd4", textDecoration: "underline" }}>Sign In</a>
        </p>
      </form>
    </div>
  );
}