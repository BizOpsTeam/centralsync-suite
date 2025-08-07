import { Bell, Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuClick}
          className="lg:hidden h-8 w-8 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, products, invoices..."
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Actions */}
        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button size="sm" className="bg-primary hover:bg-primary/90 hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Quick Sale
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-xs text-white rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/signup">Sign Up</a>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}