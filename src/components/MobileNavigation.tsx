
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, History, CreditCard, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileNavigationProps {
  isPro: boolean;
  onSignOut: () => void;
}

const MobileNavigation = ({ isPro, onSignOut }: MobileNavigationProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <div className="flex flex-col space-y-4 mt-8">
            {!isPro && (
              <Button 
                onClick={() => handleNavigation("/payment")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
            
            {isPro && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation("/history")}
                  className="w-full justify-start"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation("/billing")}
                  className="w-full justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                onSignOut();
                setOpen(false);
              }}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
