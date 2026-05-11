import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  DollarSign,
  Share2,
  Megaphone,
  NotebookPen,
  Menu,
  Calendar,
} from 'lucide-react';
import { activeClient } from '@/config/clients';
import { DateRangeProvider, PRESET_LABELS, useDateRange, type DateRangePreset } from '@/lib/dateRange';
import TargetsDialog from '@/components/layout/TargetsDialog';
import ThemeToggle from '@/components/layout/ThemeToggle';

const navItems = [
  { to: '/overview', icon: LayoutDashboard, label: 'Executive Overview' },
  { to: '/acquisition', icon: UserPlus, label: 'Patient Acquisition' },
  { to: '/revenue', icon: DollarSign, label: 'Revenue' },
  { to: '/social', icon: Share2, label: 'Social Media' },
  { to: '/ads', icon: Megaphone, label: 'Paid Ads' },
  { to: '/strategy', icon: NotebookPen, label: 'Strategy & Notes' },
];

const PRESETS: DateRangePreset[] = ['7d', '30d', '90d', 'mtd', 'last-month', 'custom'];

const DateRangePicker = () => {
  const { range, setPreset } = useDateRange();
  return (
    <label className="flex items-center gap-2 text-sm">
      <Calendar size={16} className="text-muted-foreground" />
      <select
        value={range.preset}
        onChange={e => setPreset(e.target.value as DateRangePreset)}
        className="px-2.5 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Date range"
      >
        {PRESETS.map(p => (
          <option key={p} value={p}>
            {PRESET_LABELS[p]}
          </option>
        ))}
      </select>
    </label>
  );
};

const ClientSwitcher = () => (
  <select
    disabled
    value={activeClient.id}
    className="px-2.5 py-1.5 text-sm rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
    aria-label="Client (multi-tenant coming soon)"
    title="Multi-tenant switching coming soon"
  >
    <option value={activeClient.id}>{activeClient.shortName}</option>
  </select>
);

const Shell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border">
          <img src={activeClient.logo} alt={activeClient.name} className="h-14 mx-auto" />
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sage-light text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{activeClient.name}</p>
          <p>{activeClient.locations.join(' · ')}</p>
          <p className="mt-1">Timezone: {activeClient.timezone}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-base font-semibold text-foreground">Marketing Dashboard</h2>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <TargetsDialog />
            <DateRangePicker />
            <ClientSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => (
  <DateRangeProvider>
    <Shell />
  </DateRangeProvider>
);

export default AppLayout;
