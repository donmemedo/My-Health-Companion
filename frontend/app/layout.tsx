import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import Shell from "@/components/Shell";
import PWA from "@/components/PWA";

export const metadata: Metadata = {
  title: "همراه‌سلامت من — جامعه بیماران ایران",
  description:
    "پلتفرم جامعه‌محور سلامت: ثبت علائم و درمان، دیدن روند شخصی و تجربه بیماران مشابه، با داده تجمیعی و ناشناس.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "همراه‌سلامت من" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#07080c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const noFlash = `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('locale')||'fa';document.documentElement.lang=l;document.documentElement.dir=l==='fa'?'rtl':'ltr';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <Shell>{children}</Shell>
              <PWA />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
