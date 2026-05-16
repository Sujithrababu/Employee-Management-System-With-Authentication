import "./globals.css";

export const metadata = {
  title: "Employee Management",
  description: "Simple employee management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
