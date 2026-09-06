import { LogOut, MapPin, Package, Shield, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountSection = "overview" | "orders" | "addresses" | "security";

const items = [
  { id: "overview", label: "Profile", icon: UserRound },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: Shield },
] as const;

export function AccountNav({
  active,
  onChange,
  onSignOut,
}: {
  active: AccountSection;
  onChange: (section: AccountSection) => void;
  onSignOut: () => void;
}) {
  return (
    <nav
      aria-label="Account sections"
      className="flex gap-2 overflow-x-auto border-b border-hairline pb-2 lg:block lg:space-y-1 lg:border-0 lg:pb-0"
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "label-caps inline-flex shrink-0 items-center gap-3 px-3 py-3 text-left transition-colors lg:flex lg:w-full",
            active === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
          )}
        >
          <Icon size={16} strokeWidth={1.5} />
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={onSignOut}
        className="label-caps inline-flex shrink-0 items-center gap-3 px-3 py-3 text-left text-muted-foreground transition-colors hover:text-destructive lg:mt-8 lg:flex lg:w-full"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Sign out
      </button>
    </nav>
  );
}
