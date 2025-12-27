import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext'; // Import context
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Utensils, 
  FileText, 
  Settings, 
  LogOut,
  Sprout,
  Package,
  Users,
  CalendarClock,
  NotebookPen,
  Leaf,
  Puzzle,
  User,
  Sun,
  Moon,
  Apple,
  Sparkles
} from 'lucide-react';

import appIcon from '../assets/app_icon.png';

const API_URL = 'http://127.0.0.1:8000';

export function Sidebar() {
  const { appSettings } = useApp();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [tooltip, setTooltip] = useState({ visible: false, text: '', top: 0 });

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const setGroupOpen = (label, isOpen) => {
    setOpenGroups(prev => ({ ...prev, [label]: isOpen }));
  };

  const showTooltip = (e, text) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, text, top: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, text: '', top: 0 });
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
        // Buton stili öğeler
        { icon: Sparkles, label: 'Diyet Oluştur', path: '/generate', isButton: true, buttonColor: 'accent' },
        { icon: Leaf, label: 'DetoksBot', path: '/detox-bot', isButton: true, buttonColor: 'emerald' },
        // Normal öğeler
        { icon: Utensils, label: 'Tarif Havuzu', path: '/recipes' },
        { icon: FileText, label: 'Diyet Şablonları', path: '/templates' },
        { icon: Package, label: 'Diyet Paketleri', path: '/packages' },
        { icon: Puzzle, label: 'Diyet Kombinasyonları', path: '/combinations' },
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
      {/* Floating Tooltip */}
      {tooltip.visible && (
        <div 
          className="fixed z-[99999] pointer-events-none"
          style={{ left: '60px', top: tooltip.top, transform: 'translateY(-50%)' }}
        >
          <div className="flex items-center">
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#1a1a1f]" />
            <div className="bg-[#1a1a1f] text-white text-[13px] font-medium px-3 py-2 rounded-lg shadow-lg border border-white/10">
              {tooltip.text}
            </div>
          </div>
        </div>
      )}
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
            "flex items-center justify-center rounded-xl shadow-lg shrink-0 transition-all duration-300 bg-gradient-to-br from-finrise-accent to-finrise-accent/70 overflow-hidden", 
            collapsed ? "w-8 h-8" : "w-11 h-11"
          )}>
            {appSettings?.app_logo_path ? (
               <img src={`${API_URL}${appSettings.app_logo_path}`} className="w-full h-full object-cover" alt="Logo" />
            ) : (
               <Sprout className={cn("text-white transition-all duration-300", collapsed ? "w-5 h-5" : "w-7 h-7")} />
            )}
          </div>
          
          <div className={cn(
              "flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden origin-left", 
              collapsed ? "max-w-0 opacity-0 -translate-x-4" : "max-w-[200px] opacity-100 translate-x-0"
          )}>
             <span className="text-[18px] font-bold text-finrise-text tracking-tight leading-none mb-0.5">{appSettings?.app_title || 'DiyetKent'}</span>
             <span className="text-[10px] text-finrise-muted uppercase tracking-[0.25em] font-bold ml-0.5 truncate max-w-[150px]">{appSettings?.app_description || 'ASISTAN'}</span>
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
              <div 
                key={item.label} 
                className="px-0 relative"
                onMouseEnter={() => setGroupOpen(item.label, true)}
                onMouseLeave={() => setGroupOpen(item.label, false)}
              >
                 {/* Group Header */}
                 <div
                    className={cn(
                      "flex items-center relative w-full h-[40px] px-0 cursor-pointer outline-none transition-colors",
                      isOpen ? "text-finrise-text" : "text-finrise-muted hover:text-finrise-text hover:bg-finrise-input/30"
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
                 </div>

                 {/* Collapsed Mode: Vertical Icons */}
                 {collapsed && (
                   <div className={cn(
                     "overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center gap-1 py-1",
                     isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                   )}>
                     {item.children.map(child => (
                       <NavLink
                         key={child.path}
                         to={child.path}
                         onMouseEnter={(e) => showTooltip(e, child.label)}
                          onMouseLeave={hideTooltip}
                         className={({ isActive }) => cn(
                           "w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 group/icon",
                           isActive 
                             ? "bg-finrise-input text-finrise-accent" 
                             : "text-finrise-muted hover:bg-finrise-input/50 hover:text-finrise-text"
                         )}
                       >
                         {child.isButton ? (
                           <div className={cn(
                             "flex items-center justify-center rounded-md w-7 h-7 transition-all duration-200",
                             "group-hover/icon:scale-110 group-hover/icon:rotate-3",
                             child.buttonColor === 'accent' && "bg-gradient-to-br from-finrise-accent to-finrise-accent/80 shadow-sm shadow-finrise-accent/30",
                             child.buttonColor === 'emerald' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30"
                           )}>
                             <child.icon size={14} className="text-white" />
                           </div>
                         ) : (
                           <child.icon size={18} />
                         )}
                       </NavLink>
                     ))}
                   </div>
                 )}

                 {/* Expanded Mode: Normal Dropdown */}
                 <div className={cn(
                    "overflow-hidden transition-[max-height] duration-300 ease-in-out bg-black/5",
                    !collapsed && isOpen ? "max-h-[500px] py-1" : "max-h-0"
                 )}>
                    {item.children.map(child => (
                  <div key={child.path} className="relative">
                    {!child.isButton && (
                      <NavLink
                        to={child.path}
                        className={({ isActive }) => cn(
                           "absolute left-0 top-1 bottom-1 w-[3px] transition-all duration-300 rounded-r-full z-10",
                           isActive ? "bg-finrise-accent shadow-lg shadow-finrise-accent/40" : "bg-transparent"
                        )}
                      />
                    )}
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
                            {child.isButton ? (
                              <div className={cn(
                                "flex items-center justify-center rounded-md w-6 h-6 transition-all duration-300",
                                "group-hover/child:scale-110 group-hover/child:rotate-3 group-hover/child:shadow-lg",
                                child.buttonColor === 'accent' && "bg-gradient-to-br from-finrise-accent to-finrise-accent/80 shadow-sm shadow-finrise-accent/30 group-hover/child:shadow-finrise-accent/50",
                                child.buttonColor === 'emerald' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30 group-hover/child:shadow-emerald-500/50"
                              )}>
                                <child.icon size={14} className="text-white" />
                              </div>
                            ) : (
                              <child.icon size={16} className={cn("opacity-60", isActive && "opacity-100 text-finrise-accent")} />
                            )}
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
               {!item.isButton && (
                 <NavLink
                   to={item.path}
                   className={({ isActive }) => cn(
                      "absolute left-0 top-1 bottom-1 w-[3px] transition-all duration-300 rounded-r-full z-10",
                      isActive ? "bg-finrise-accent shadow-lg shadow-finrise-accent/40" : "bg-transparent"
                   )}
                 />
               )}
               
              <NavLink
                to={item.path}
                onMouseEnter={(e) => showTooltip(e, item.label)}
                onMouseLeave={hideTooltip}
                className={({ isActive }) => cn(
                  "flex items-center relative group/item h-[40px] px-0 transition-all duration-300",
                  isActive 
                    ? "bg-finrise-input/50 text-finrise-text font-medium" 
                    : "text-finrise-muted hover:bg-finrise-input/30 hover:text-finrise-text"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div 
                      className={cn(
                          "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
                          collapsed ? "w-full" : "w-[52px]"
                      )}
                    >
                      {item.isButton ? (
                        <div className={cn(
                          "flex items-center justify-center rounded-lg transition-all duration-300",
                          "group-hover/item:scale-110 group-hover/item:rotate-3 group-hover/item:shadow-lg",
                          collapsed ? "w-8 h-8" : "w-7 h-7",
                          item.buttonColor === 'accent' && "bg-gradient-to-br from-finrise-accent to-finrise-accent/80 shadow-md shadow-finrise-accent/30 group-hover/item:shadow-finrise-accent/50",
                          item.buttonColor === 'emerald' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30 group-hover/item:shadow-emerald-500/50"
                        )}>
                          <item.icon className="w-4 h-4 text-white transition-transform duration-300 group-hover/item:scale-110" />
                        </div>
                      ) : (
                        <item.icon 
                          className={cn(
                              "transition-all duration-300", 
                              collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                              isActive ? "opacity-100 text-finrise-accent" : "opacity-60 group-hover/item:opacity-90"
                          )} 
                        />
                      )}
                    </div>
                    
                    <span className={cn(
                      "absolute left-[52px] text-[14px] font-medium tracking-wide whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2",
                      collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
                    )}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Profile, Settings, Theme, Logout */}
      <div className="p-0 border-t border-finrise-border bg-finrise-input/30">
        
        {/* Profile & Settings Links */}
        {bottomItems.map((item) => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let avatarUrl = null;
            if (item.label === 'Profil' && user.avatar_path) {
                avatarUrl = user.avatar_path.startsWith('http') 
                    ? user.avatar_path 
                    : `http://127.0.0.1:8000${user.avatar_path}`;
            }

            return (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={(e) => showTooltip(e, item.label)}
            onMouseLeave={hideTooltip}
            className={({ isActive }) => cn(
              "flex items-center relative group h-[50px] px-0 text-finrise-muted hover:bg-finrise-input/50 hover:text-finrise-text",
              isActive && "text-finrise-text bg-finrise-input/50"
            )}
          >
            <div className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-300 h-full",
                collapsed ? "w-full" : "w-[52px]"
            )}>
              {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className={cn(
                        "rounded-full object-cover border border-finrise-border bg-finrise-input",
                        collapsed ? "w-6 h-6" : "w-[22px] h-[22px]",
                        "opacity-90 group-hover:opacity-100 transition-opacity"
                    )}
                  />
              ) : (
                  <item.icon 
                    className={cn(
                        "transition-all duration-300",
                        collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                        "opacity-70 group-hover:opacity-100"
                    )}
                  />
              )}
            </div>
            <span className={cn(
              "absolute left-[52px] text-[14px] font-medium tracking-wide whitespace-nowrap transition-all duration-300 top-1/2 -translate-y-1/2",
              collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
            )}>
              {item.label}
            </span>
          </NavLink>
        );
        })}
      </div>
    </div>
  );
}
