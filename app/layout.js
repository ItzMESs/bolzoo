import "./globals.css";

export const metadata = {
  title: "Болзоо Урилга",
  description: "Хайртдаа зориулсан тоглоомтой урилга үүсгэгч",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
