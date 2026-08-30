import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Hiskra Store",
  description: "Loja online Hiskra - Roupas e acessórios com estilo",
  openGraph: {
    title: "Hiskra Store",
    description: "Loja online Hiskra - Roupas e acessórios com estilo",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-100 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hiskra Store</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Roupas e acessórios com estilo para o seu dia a dia.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Links rápidos</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li><a href="/products" className="hover:text-gray-900">Produtos</a></li>
                    <li><a href="/cart" className="hover:text-gray-900">Carrinho</a></li>
                    <li><a href="/auth" className="hover:text-gray-900">Minha conta</a></li>
                    <li><a href="/admin" className="hover:text-gray-900">Painel de links</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Suporte</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-gray-900">Perguntas frequentes</a></li>
                    <li><a href="#" className="hover:text-gray-900">Trocas e devoluções</a></li>
                    <li><a href="#" className="hover:text-gray-900">Contato</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Hiskra Store. Todos os direitos reservados.
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}