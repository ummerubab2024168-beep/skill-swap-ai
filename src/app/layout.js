// src/app/layout.js
import { ReduxProvider } from "@/redux/provider"; // @ symbol use karna best practice hai
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Puri app ko Redux ke sath connect kar diya */}
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}