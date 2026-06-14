'use client';
import { useState, useEffect } from 'react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: '', department: '', salary: ''
  });
  const [editId, setEditId] = useState(null);

  // 1. Fetch data from local JSON API
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const result = await res.json();
      if (result.success) setEmployees(result.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Submit Handle (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/employees/${editId}` : '/api/employees';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        fetchEmployees(); // List refresh karo
        setFormData({ name: '', email: '', phone: '', role: '', department: '', salary: '' });
        setEditId(null);
        alert(editId ? "Employee details updated!" : "Employee added successfully!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Something went wrong!");
    }
  };

  // 3. Edit Trigger
  const handleEdit = (emp) => {
    setEditId(emp._id); // Yahan string ID track hogi
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      department: emp.department,
      salary: emp.salary
    });
  };

  // 4. Delete Handle
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        fetchEmployees(); // List refresh karo
        alert("Employee deleted successfully!");
      } else {
        alert("Could not delete from file!");
      }
    } catch (err) {
      alert("Could not delete!");
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#111827', color: '#ffffff', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ color: '#60a5fa', marginBottom: '30px', borderBottom: '2px solid #374151', paddingBottom: '15px' }}>
          📊 Employee Management Dashboard
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          
          {/* FORM */}
          <div style={{ flex: '1 1 350px', backgroundColor: '#1f2937', padding: '25px', borderRadius: '12px', border: '1px solid #4b5563', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#f3f4f6' }}>
              {editId ? "✏️ Edit Employee Details" : "➕ Add New Employee"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Role</label>
                  <input type="text" name="role" value={formData.role} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '5px' }}>Monthly Salary (₹)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                {editId ? "Update Employee" : "Save Employee"}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', email: '', phone: '', role: '', department: '', salary: '' }); }}
                  style={{ backgroundColor: '#4b5563', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '5px' }}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* TABLE LIST */}
          <div style={{ flex: '1 1 600px', backgroundColor: '#1f2937', padding: '25px', borderRadius: '12px', border: '1px solid #4b5563', overflowX: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#f3f4f6' }}>👥 Active Staff Directory ({employees.length})</h2>
            
            {loading ? (
              <p style={{ color: '#9ca3af' }}>Loading database...</p>
            ) : employees.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>No employees found. Add some from the left form!</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #374151', color: '#9ca3af', fontSize: '0.9rem' }}>
                    <th style={{ paddingBottom: '12px' }}>Name / Role</th>
                    <th style={{ paddingBottom: '12px' }}>Contact</th>
                    <th style={{ paddingBottom: '12px' }}>Department</th>
                    <th style={{ paddingBottom: '12px' }}>Salary</th>
                    <th style={{ paddingBottom: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {employees.map((emp) => (
                    <tr key={emp._id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '12px 0' }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{emp.role}</div>
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        <div>{emp.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{emp.phone}</div>
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0', color: '#34d399', fontWeight: 'bold' }}>
                        ₹{Number(emp.salary).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'center' }}>
                        {/* Fix: Directly passing emp object & _id */}
                        <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}>Edit</button>
                        <button onClick={() => handleDelete(emp._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}