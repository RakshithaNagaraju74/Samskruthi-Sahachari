import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samskruthi Sahaachari - Karnataka Travel",
  description: "Discover the soul of South India with Samskruthi Sahaachari",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <UserProvider>  {/* Add UserProvider here */}
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}