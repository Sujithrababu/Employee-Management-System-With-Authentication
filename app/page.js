import { cookies } from "next/headers";
import crypto from "crypto";
import Link from "next/link";
import connectDB from "@/lib/db";
import { Department, Employee, User } from "@/lib/models";
import {
  login,
  logout,
  saveEmployee,
  seedDepartments,
  signup,
} from "./actions";
import DeleteButton from "./DeleteButton";

async function getSessionUser() {
  const token = (await cookies()).get("user")?.value;
  if (!token) return null;

  const [id, sign] = token.split(".");
  const correctSign = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(id)
    .digest("hex");

  if (sign !== correctSign) return null;

  await connectDB();
  return User.findById(id).lean();
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="login-page">
        <section className="auth-box">
          <h1>Employee Management</h1>
          <div className="auth-grid">
            <form action={login}>
              <h2>Login</h2>
              <input name="email" type="email" placeholder="Email" required />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <button>Login</button>
            </form>

            <form action={signup}>
              <h2>Signup</h2>
              <input name="name" placeholder="Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <button>Create Account</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  await seedDepartments();

  const search = params?.search || "";
  const departments = await Department.find().lean();
  const employees = await Employee.find({
    name: { $regex: search, $options: "i" },
  })
    .populate("department")
    .lean();
  const editEmployee = params?.edit
    ? await Employee.findById(params.edit).lean()
    : null;

  return (
    <main className="page">
      <header>
        <div>
          <p>Welcome, {user.name}</p>
          <h1>Employee Management</h1>
        </div>
        <form action={logout}>
          <button>Logout</button>
        </form>
      </header>

      <section className="form-section">
        <h2>{editEmployee ? "Edit Employee" : "Add Employee"}</h2>
        <form action={saveEmployee} className="employee-form">
          <input
            name="id"
            type="hidden"
            defaultValue={editEmployee?._id?.toString()}
          />
          <input
            name="name"
            placeholder="Name"
            defaultValue={editEmployee?.name}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={editEmployee?.email}
            required
          />
          <select
            name="department"
            defaultValue={editEmployee?.department?.toString()}
            required
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id.toString()}>
                {department.name}
              </option>
            ))}
          </select>
          <input
            name="salary"
            type="number"
            placeholder="Salary"
            defaultValue={editEmployee?.salary}
            required
          />
          <input
            name="joiningDate"
            type="date"
            defaultValue={editEmployee?.joiningDate}
            required
          />
          <button>{editEmployee ? "Update" : "Add"}</button>
          {editEmployee && <Link href="/">Cancel</Link>}
        </form>
      </section>

      <section>
        <div className="table-top">
          <h2>Employee List</h2>
          <form>
            <input name="search" placeholder="Search by name" defaultValue={search} />
            <button>Search</button>
          </form>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Joining Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.department?.name}</td>
                <td>{employee.salary}</td>
                <td>{employee.joiningDate}</td>
                <td className="actions">
                  <Link href={`/?edit=${employee._id}`}>Edit</Link>
                  <DeleteButton id={employee._id.toString()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
