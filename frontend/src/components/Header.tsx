import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Sparkles } from "lucide-react";
import SettingsModal from "./SettingsModal";
import ApiKeyStatus from "./ApiKeyStatus";
const Header = () => {
  return <header className="border-b bg-card/50 sticky top-0 z-50">
      <div className="container mx-auto px-20 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-3xl shadow-md">
              <Brain className="h-6 w-6 bg-green-500 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hopnote</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            <SettingsModal />
            <Button className="text-gray-600 hover:text-green-600 hover:bg-white bg-white" size="sm">
              My Library
            </Button>
            <Button className="bg-green-500 text-white font-normal rounded-lg px-5 hover:bg-green-600" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;