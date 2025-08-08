import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Megaphone,
    Receipt,
    Settings,
    ChevronLeft,
    ChevronRight,
    Building,
    FileText,
    Brain,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "AI Insights", href: "/ai", icon: Brain },
    { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleNavigation = (href: string) => {
        navigate(href);
        // Close mobile sidebar after navigation
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <div
            className={cn(
                "bg-white border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0",
                collapsed ? "w-16" : "w-64",
                mobileOpen ? "w-64" : "",
                mobileOpen ? "fixed inset-y-0 left-0 z-50" : ""
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    {(!collapsed || mobileOpen) && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">Biz-Suite</h1>
                                <p className="text-xs text-muted-foreground">Business Management</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        {/* Mobile Close Button */}
                        {mobileOpen && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMobileClose}
                                className="h-8 w-8 p-0 lg:hidden"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        {/* Desktop Toggle Button */}
                        {!mobileOpen && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggle}
                                className="h-8 w-8 p-0 hidden lg:block"
                            >
                                {collapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <ChevronLeft className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full",
                                "hover:bg-accent hover:text-accent-foreground",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground",
                                (collapsed && !mobileOpen) ? "justify-center" : "justify-start"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", (!collapsed || mobileOpen) && "mr-3")} />
                            {(!collapsed || mobileOpen) && <span>{item.name}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-border">
                <div className={cn("flex items-center", (collapsed && !mobileOpen) ? "justify-center" : "space-x-3")}>
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{user?.name.charAt(0)}</span>
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}