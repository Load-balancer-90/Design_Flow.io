import './globals.css';

export const metadata = {
  title: 'Design_Flow.io',
  description: 'Collaborative system-design canvas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
