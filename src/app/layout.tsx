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
  title: "SenseIT — DISASTER SURVEILLANCE MANAGEMENT",
  description:
    "Integrated Emergency Operations Network · Cyclone Surveillance Wing",
  icons: {
    icon: "/logo-mark.png",
    shortcut: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/logo-mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Suppress Google Maps Billing/Auth console error overlay in development */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  function isGoogleMapsBillingMsg(arg) {
                    return typeof arg === 'string' && (
                      arg.indexOf('BillingNotEnabledMapError') !== -1 ||
                      arg.indexOf('billing-not-enabled-map-error') !== -1 ||
                      arg.indexOf('ApiNotActivatedMapError') !== -1 ||
                      arg.indexOf('Google Maps JavaScript API error') !== -1 ||
                      arg.indexOf('maps-no-account') !== -1
                    );
                  }

                  function wrapConsoleError(orig) {
                    return function() {
                      for (var i = 0; i < arguments.length; i++) {
                        if (isGoogleMapsBillingMsg(arguments[i])) {
                          window.dispatchEvent(new CustomEvent('senseit_maps_billing_error'));
                          return;
                        }
                      }
                      if (typeof orig === 'function') {
                        return orig.apply(console, arguments);
                      }
                    };
                  }

                  var currentError = wrapConsoleError(console.error);
                  try {
                    Object.defineProperty(console, 'error', {
                      configurable: true,
                      enumerable: true,
                      get: function() { return currentError; },
                      set: function(newFn) { currentError = wrapConsoleError(newFn); }
                    });
                  } catch (e) {
                    console.error = currentError;
                  }

                  // Suppress window.alert for Google Maps billing message
                  var origAlert = window.alert;
                  window.alert = function(msg) {
                    if (isGoogleMapsBillingMsg(msg)) {
                      return;
                    }
                    if (origAlert) return origAlert.apply(window, arguments);
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
