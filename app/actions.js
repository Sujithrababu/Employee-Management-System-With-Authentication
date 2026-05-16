"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { Department, Employee, User } from "@/lib/models";

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + process.env.JWT_SECRET)
    .digest("hex");
}

function makeToken(id) {
  const sign = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(id)
    .digest("hex");
  return `${id}.${sign}`;
}

async function getUserId() {
  const token = (await cookies()).get("user")?.value;
  if (!token) return null;

  const [id, sign] = token.split(".");
  return sign === makeToken(id).split(".")[1] ? id : null;
}

async function requireLogin() {
  const userId = await getUserId();
  if (!userId) redirect("/");
  return userId;
}

export async function seedDepartments() {
  await connectDB();
  const names = ["Engineering", "HR", "Sales"];

  for (const name of names) {
    await Department.updateOne({ name }, { name }, { upsert: true });
  }
}

export async function signup(formData) {
  await connectDB();

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const user = await User.create({
    name,
    email,
    password: hashPassword(password),
  });

  (await cookies()).set("user", makeToken(user._id.toString()));
  redirect("/");
}

export async function login(formData) {
  await connectDB();

  const email = formData.get("email");
  const password = hashPassword(formData.get("password"));
  const user = await User.findOne({ email, password });

  if (user) {
    (await cookies()).set("user", makeToken(user._id.toString()));
  }

  redirect("/");
}

export async function logout() {
  (await cookies()).delete("user");
  redirect("/");
}

export async function saveEmployee(formData) {
  await requireLogin();
  await connectDB();

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    department: formData.get("department"),
    salary: Number(formData.get("salary")),
    joiningDate: formData.get("joiningDate"),
  };

  const id = formData.get("id");
  if (id) {
    await Employee.findByIdAndUpdate(id, data);
  } else {
    await Employee.create(data);
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteEmployee(formData) {
  await requireLogin();
  await connectDB();
  await Employee.findByIdAndDelete(formData.get("id"));
  revalidatePath("/");
}


