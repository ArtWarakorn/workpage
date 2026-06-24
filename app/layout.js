import './globals.css';

export const metadata = {
  title: 'ระบบจัดการงาน',
  description: 'Task Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
