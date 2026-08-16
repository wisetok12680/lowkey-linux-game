import './globals.css';

export const metadata = {
  title: 'Lowkey Linux - Interactive Privilege Escalation CTF',
  description: 'Master Linux command-line skills and privilege escalation levels in an interactive browser terminal backed by Neon Postgres.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0d14] text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
