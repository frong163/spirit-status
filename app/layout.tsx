import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spirit Status — เช็กพลังงานวันนี้",
  description: "จั่วไพ่ทาโรต์วันละครั้ง ปรับพลังงาน 5 ด้าน แข่งขัน Leaderboard โลก",
  openGraph: { title: "Spirit Status", description: "เช็กพลังงานวันนี้ รับพลังดีทุกวัน", type: "website" },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  themeColor: "#7C3AED", viewportFit: "cover",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
