import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Sparkles } from "lucide-react";
import SettingsModal from "./SettingsModal";
import ApiKeyStatus from "./ApiKeyStatus";
import { useLocation } from "react-router-dom";
const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  return <header className="border-b bg-card/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src="/hopenote-logo.png" alt="Hopnote" className="h-8 w-10 md:h-8 md:w-10 object-contain" />
            <div>
              {/* text should be in good font */}
              {/* <h1 className="text-xl font-bold text-foreground font-['Courier New']">HopNote</h1> */}
              <div className="text-emerald-950 text-lg">Hopnote</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            {/* <SettingsModal />
            <Button className="text-gray-600 hover:text-green-600 hover:bg-white bg-white hidden sm:inline-flex" size="sm">
              My Library
            </Button> */}
            {isHome && (
              <Button className="bg-emerald-600 text-white font-normal rounded-3xl px-5 hover:bg-emerald-600 hidden sm:inline-flex" size="sm">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;