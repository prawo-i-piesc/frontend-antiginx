import { pageTitle } from "@/app/i18n/server";

export const generateMetadata = pageTitle("adminUsers");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
