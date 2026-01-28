export default function PopularProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Этот layout не проверяет NextAuth, так как страница использует AdminGate
  return <>{children}</>;
}
