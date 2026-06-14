import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true }, // e.g., Developer, HR, Manager
  department: { type: String, required: true }, // e.g., IT, Sales
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  status: { type: String, default: 'Active' }, // Active, Inactive
});

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);