// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { sidebarLinks } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { UserProvider } from "@/components/providers/user-provider"; // ✅ NUEVA IMPORTACIÓN
import {
  DashboardSidebar,
  MobileSheetSidebar,
} from "@/components/layout/dashboard-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import { CreditsDisplay } from "@/components/layout/credits";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  
  const filteredLinks = sidebarLinks
    .filter((section) => !section.authorizeOnly || section.authorizeOnly === user.role)
    .map((section) => ({
      ...section,
      items: section.items.filter(
        ({ authorizeOnly }) => !authorizeOnly || authorizeOnly === user.role,
      ),
    }));

  return (
    <UserProvider user={user}> {/* ✅ Envolver TODO el layout */}
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar links={filteredLinks} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 bg-background px-4 lg:h-4 xl:px-8">
            <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
              <MobileSheetSidebar links={filteredLinks} />
              <div className="w-full flex-1">
                {/* <SearchCommand links={filteredLinks} /> */}
              </div>
              <div className="flex items-center gap-x-3 md:hidden">
                <ModeToggle />
                <CreditsDisplay />
                <UserAccountNav />
              </div>
            </MaxWidthWrapper>
          </header>
          <main className="flex-1 p-4 xl:px-8">
            <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
              {children}
            </MaxWidthWrapper>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
