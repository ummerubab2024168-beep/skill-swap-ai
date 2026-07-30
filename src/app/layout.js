import { ReduxProvider } from "../redux/provider"; // Provider ko import kiya
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}