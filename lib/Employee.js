import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, default: '' },
  role: { type: String, default: 'User' }, // e.g., Developer, HR, Manager
  department: { type: String, default: 'General' }, // e.g., IT, Sales
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }, // Active, Inactive
});

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);