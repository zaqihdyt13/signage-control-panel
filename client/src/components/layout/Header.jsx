import { Menu, Bell, UserCircle } from "lucide-react";
import LogoutButton from "../ui/LogoutButton";

export default function Header({ onMenuClick }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-base-300 bg-base-100 px-5 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="btn btn-ghost btn-square lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <p className="text-sm text-base-content/60">Manage your digital signage network</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LogoutButton />

        <div className="flex items-center gap-2 border-l border-base-300 pl-4">
          <UserCircle size={32} className="text-primary" />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">Administrator</p>
            <p className="text-xs text-base-content/60">System Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
