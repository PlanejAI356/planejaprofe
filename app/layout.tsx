import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://planejaioficial.com.br"),

  title: {
    default: "PlanejAI | Plano de Aula com Inteligência Artificial",
    template: "%s | PlanejAI",
  },

  description:
    "Crie planos de aula completos e personalizados com inteligência artificial. Gere objetivos, habilidades da BNCC, metodologia, avaliação, recursos, referências e atividades.",

  keywords: [
    "plano de aula",
    "plano de aula com inteligência artificial",
    "plano de aula com IA",
    "gerador de plano de aula",
    "planejamento de aula",
    "planejamento escolar",
    "plano de aula BNCC",
    "inteligência artificial para professores",
    "ferramentas para professores",
    "PlanejAI",
  ],

  authors: [
    {
      name: "PlanejAI",
      url: "https://planejaioficial.com.br",
    },
  ],

  creator: "PlanejAI",
  publisher: "PlanejAI",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "PlanejAI | Plano de Aula com Inteligência Artificial",
    description:
      "Crie planos de aula completos e personalizados com IA, alinhados à BNCC e adaptados ao seu estilo de ensino.",
    url: "https://planejaioficial.com.br",
    siteName: "PlanejAI",
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PlanejAI | Plano de Aula com Inteligência Artificial",
    description:
      "Crie planos de aula completos e personalizados com IA, alinhados à BNCC e adaptados ao seu estilo de ensino.",
  },

  category: "Educação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}