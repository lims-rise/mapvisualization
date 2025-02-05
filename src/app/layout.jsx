
import localFont from "next/font/local";
import "./globals.css";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Map Visualization",
  description: "Rise data visualization",
};

export default function RootLayout({ children }) {
  return  (
    <html lang="en">
    <head>
      <link rel="icon" href="/icons/rise.png" type="image/png"  sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
      <link rel="shortcut icon" href="/icons/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="manifest" href="/icons/site.webmanifest" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  ) ;
}
