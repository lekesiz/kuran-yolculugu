import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { BookOpen, LogOut, Moon, NotebookPen, Settings, Sun, User } from "lucide-react";
import { Link, useLocation } from "wouter";

const NAV = [
  { href: "/duraklar", label: "Duraklar" },
  { href: "/notlarim", label: "Notlarım" },
  { href: "/hakkinda", label: "Yöntem" },
];

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
          style={{ transitionTimingFunction: "var(--ease-out)" }}>
          <span className="flex size-8 items-center justify-center rounded-md border border-accent/60 bg-accent/25">
            <BookOpen className="size-4 text-accent-foreground" />
          </span>
          <span className="font-serif text-lg font-semibold leading-none tracking-tight">
            Kur'an'ı Anlama Yolculuğu
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map(item => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                style={{ transitionTimingFunction: "var(--ease-out)" }}>
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-foreground/70" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {switchable && toggleTheme && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
              className="size-9">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9" aria-label="Hesap menüsü">
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{user?.name ?? "Okuyucu"}</p>
                  {user?.email && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/notlarim" className="flex w-full items-center gap-2">
                    <NotebookPen className="size-4" /> Notlarım
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/yonetim" className="flex w-full items-center gap-2">
                      <Settings className="size-4" /> İçerik Yönetimi
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="gap-2">
                  <LogOut className="size-4" /> Çıkış yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => startLogin()} className="h-9">
              Giriş yap
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="container flex items-center gap-1 border-t border-border/60 pb-2 pt-1.5 md:hidden">
        {NAV.map(item => {
          const active = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
