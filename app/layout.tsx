export const metadata = {
  title: "Crowd Map",
  description: "Demo карта заведений"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{margin:0, padding:0}}>
        {children}
      </body>
    </html>
  );
}
