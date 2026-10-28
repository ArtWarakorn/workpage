import './globals.css';

export const metadata = {
  title: 'ระบบจัดการงาน',
  description: 'Task Management System',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
