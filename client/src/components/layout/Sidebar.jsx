import { NavLink } from "react-router-dom";
import { LayoutDashboard, Monitor, Images, TvMinimalPlay } from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Devices",
    path: "/devices",
    icon: Monitor,
  },
  {
    label: "Contents",
    path: "/contents",
    icon: Images,
  },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-base-300 bg-base-100">
      <div className="flex h-20 items-center gap-3 border-b border-base-300 px-6">
        <div className="rounded-xl bg-primary p-2 text-primary-content">
          <TvMinimalPlay size={24} />
        </div>

        <div>
          <h1 className="text-lg font-bold">Signage</h1>
          <p className="text-xs text-base-content/60">Control Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">
          Management
        </p>

        <ul className="menu gap-1 p-0">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 ${
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-base-content/70 hover:bg-base-200"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-base-300 p-4">
        <p className="text-center text-xs text-base-content/50">Signage Control Panel v1.0</p>
      </div>
    </aside>
  );
}
