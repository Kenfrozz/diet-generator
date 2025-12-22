import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Utensils, 
  FileText, 
  ChefHat, 
  Settings, 
  LogOut,
  Sprout,
  Package,
  Users,
  CalendarClock,
  NotebookPen,
  Leaf,
  UtensilsCrossed,
  User,
  Sun,
  Moon,
  Apple
} from 'lucide-react';

import appIcon from '../assets/icons/app_icon.png';

export function Sidebar() {
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({ 'Diyetler': true });
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleGroup = (label) => {
    if (collapsed) setCollapsed(false);
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Genel Bakış', path: '/dashboard' },
    { icon: CalendarClock, label: 'Randevular', path: '/appointments' },
    { icon: Users, label: 'Danışanlar', path: '/clients' },
    { icon: NotebookPen, label: 'Notlar', path: '/notes' },
    { 
      label: 'Diyetler', 
      icon: Apple, 
      children: [
        { icon: ChefHat, label: 'Diyet Oluştur', path: '/generate' },
        { icon: Leaf, label: 'DetoksBot', path: '/detox-bot' },
        { icon: Utensils, label: 'Tarif Havuzu', path: '/recipes' },
        { icon: FileText, label: 'Diyet Şablonları', path: '/templates' },
        { icon: Package, label: 'Diyet Paketleri', path: '/packages' },
      ]
    },
  ];

  const bottomItems = [
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: Settings, label: 'Ayarlar', path: '/settings' },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-finrise-sidebar flex flex-col shadow-2xl z-20 transition-[width] duration-300 ease-out relative border-r border-finrise-border shrink-0 will-change-[width] overflow-visible",
        collapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleCollapsed}
        className="absolute -right-3 top-[62px] bg-finrise-input text-finrise-muted hover:text-finrise-text p-0.5 rounded-full border border-finrise-border shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center w-6 h-6 outline-none cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={cn(
        "h-[92px] flex items-start pt-6 border-b border-finrise-border transition-all duration-300 overflow-hidden relative",
        collapsed ? "justify-center px-0" : "px-6"
      )}>
        <div className={cn("flex items-center transition-all duration-300", collapsed ? "gap-0" : "gap-3")}>
          <div className={cn(
            "flex items-center justify-center rounded-xl shadow-lg shrink-0 transition-all duration-300 bg-gradient-to-br from-finrise-accent to-finrise-accent/70", 
            collapsed ? "w-8 h-8" : "w-11 h-11"
          )}>
            <Sprout className={cn("text-white transition-all duration-300", collapsed ? "w-5 h-5" : "w-7 h-7")} />
          </div>
          
          <div className={cn(
              "flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden origin-left", 
              collapsed ? "max-w-0 opacity-0 -translate-x-4" : "max-w-[200px] opacity-100 translate-x-0"
          )}>
             <span className="text-[20px] font-bold text-finrise-text tracking-tight leading-none mb-0.5">DiyetBot</span>
             <span className="text-[11px] text-finrise-muted uppercase tracking-[0.25em] font-bold ml-0.5">Asistan</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-0 space-y-0.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item, index) => {
          if (item.children) {
            // Dropdown Group
            const isOpen = openGroups[item.label];
            const isActiveGroup = item.children.some(child => location.pathname === child.path);

            return (
              <div key={item.label} className="px-0 relative group">
                 {/* Group Header */}
                 <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "flex items-center relative w-full h-[40px] px-0 cursor-pointer outline-none transition-colors",
                      !collapsed && isOpen ? "text-finrise-text" : "text-finrise-muted hover:text-finrise-text hover:bg-finrise-input/30"
                    )}
                    title={collapsed ? item.label : ""}
                 >
                    <div 
                      className={cn(
                          "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
                          collapsed ? "w-full" : "w-[52px]"
                      )}
                    >
                        <item.icon 
                          className={cn(
                              "transition-all duration-300", 
                              collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                              isActiveGroup ? "text-finrise-accent" : "opacity-70 group-hover:opacity-100"
                          )} 
                        />
                    </div>
                    
                    <span className={cn(
                      "absolute left-[52px] text-[14px] font-medium tracking-wide whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2 flex items-center justify-between w-[160px]",
                      collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
                    )}>
                      {item.label}
                      <ChevronRight size={14} className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "")} />
                    </span>
                 </button>

                 {/* Group Children */}
                 <div className={cn(
                    "overflow-hidden transition-[height] duration-300 ease-in-out bg-black/5",
                    !collapsed && isOpen ? "h-auto py-1" : "h-0"
                 )}>
                    {item.children.map(child => (
                  <div key={child.path} className="relative">
                    <NavLink
                        to={child.path}
                        className={({ isActive }) => cn(
                           "absolute left-0 top-1 bottom-1 w-[3px] transition-all duration-300 rounded-r-full z-10",
                           isActive ? "bg-finrise-accent shadow-lg shadow-finrise-accent/40" : "bg-transparent"
                        )}
                    />
                    <NavLink
                      to={child.path}
                      className={({ isActive }) => cn(
                        "flex items-center relative group/child h-[36px] px-0 pl-4",
                        isActive 
                          ? "bg-finrise-input/50 text-finrise-text font-medium" 
                          : "text-finrise-muted hover:bg-finrise-input/30 hover:text-finrise-text"
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="w-[36px] flex items-center justify-center shrink-0">
                              <child.icon size={16} className={cn("opacity-60", isActive && "opacity-100 text-finrise-accent")} />
                          </div>
                          <span className="text-[13px] whitespace-nowrap">
                              {child.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </div>
                    ))}
                 </div>
              </div>
            );
          }

          // Single Item
          return (
            <div key={item.path} className="px-0 relative group">
               <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                     "absolute left-0 top-1 bottom-1 w-[3px] transition-all duration-300 rounded-r-full z-10",
                     isActive ? "bg-finrise-accent shadow-lg shadow-finrise-accent/40" : "bg-transparent"
                  )}
               />
               
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center relative group/item h-[40px] px-0",
                  isActive 
                    ? "bg-finrise-input/50 text-finrise-text font-medium" 
                    : "text-finrise-muted hover:bg-finrise-input/30 hover:text-finrise-text"
                )}
                title={collapsed ? item.label : ""}
              >
                <div 
                  className={cn(
                      "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
                      collapsed ? "w-full" : "w-[52px]"
                  )}
                >
                    <item.icon 
                      className={cn(
                          "transition-all duration-300", 
                          collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                          ({isActive}) => isActive ? "opacity-100 text-finrise-accent" : "opacity-60 group-hover/item:opacity-90"
                      )} 
                    />
                </div>
                
                <span className={cn(
                  "absolute left-[52px] text-[14px] font-medium tracking-wide whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2",
                  collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
                )}>
                  {item.label}
                </span>
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Profile, Settings, Theme, Logout */}
      <div className="p-0 border-t border-finrise-border bg-finrise-input/30">
        
        {/* Profile & Settings Links */}
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center relative group h-[50px] px-0 text-finrise-muted hover:bg-finrise-input/50 hover:text-finrise-text",
              isActive && "text-finrise-text bg-finrise-input/50"
            )}
            title={collapsed ? item.label : ""}
          >
            <div className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
                collapsed ? "w-full" : "w-[52px]"
            )}>
              <item.icon 
                className={cn(
                    "transition-all duration-300",
                    collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                    "opacity-70 group-hover:opacity-100"
                )}
              />
            </div>
            <span className={cn(
              "absolute left-[52px] text-[14px] font-medium tracking-wide whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2",
              collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
            )}>
              {item.label}
            </span>
          </NavLink>
        ))}



        {/* Logout */}
        <button 
            onClick={handleLogout}
            className={cn(
                "flex items-center w-full text-finrise-red hover:bg-finrise-red/10 transition-all duration-200 group h-[50px] relative px-0 border-t border-finrise-border",
            )}
            title={collapsed ? "Çıkış Yap" : ""}
        >
          <div className={cn(
              "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
              collapsed ? "w-full" : "w-[52px]"
          )}>
            <LogOut 
              className={cn(
                  "transition-all duration-300",
                  collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                  "opacity-70 group-hover:opacity-100"
              )}
            />
          </div>

          <span className={cn(
            "absolute left-[52px] text-[14px] font-medium whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2",
            collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
          )}>
            Çıkış Yap
          </span>
        </button>
      </div>
    </div>
  );
}
