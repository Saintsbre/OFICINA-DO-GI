import React from 'react';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background font-body">
        {children}
      </body>
    </html>
  );
}
