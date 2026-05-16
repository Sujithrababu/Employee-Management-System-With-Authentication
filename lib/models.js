import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, unique: true },
});

const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  salary: Number,
  joiningDate: String,
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Department =
  mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
export const Employee =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
