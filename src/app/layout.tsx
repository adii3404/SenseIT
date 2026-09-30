import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SenseIT — Cyclone Vulnerability Forecaster",
  description:
    "Understand which hospitals, power grids and communities are at risk before a cyclone makes landfall — and act in time.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Suppress Google Maps Billing/Auth console error overlay in development */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var arg = arguments[i];
                      if (typeof arg === 'string' && (
                        arg.indexOf('BillingNotEnabledMapError') !== -1 ||
                        arg.indexOf('billing-not-enabled-map-error') !== -1 ||
                        arg.indexOf('ApiNotActivatedMapError') !== -1
                      )) {
                        console.warn('[senseit] Intercepted Google Maps error:', arg);
                        window.dispatchEvent(new CustomEvent('senseit_maps_billing_error'));
                        return;
                      }
                    }
                    origError.apply(console, arguments);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
