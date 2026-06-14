export const metadata = {
  title: 'Vibe Task Manager',
  description: 'A simple task manager built with Next.js and MongoDB.',
};

import AuthGuard from './components/AuthGuard';
import Header from './components/Header';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
