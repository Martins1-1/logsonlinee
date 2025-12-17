import { Button } from "@/components/ui/button";
import { History, Menu, MoreVertical } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/imagelogo2.PNG";

interface NavbarProps {
  isShopPage?: boolean;
  cartItemCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
  onGeneralMenuClick?: () => void;
}

const Navbar = ({ isShopPage = false, cartItemCount = 0, onCartClick, onMenuClick, onGeneralMenuClick }: NavbarProps) => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isShopPage && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src={logo} 
                alt="Logs Online Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Logs Online</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {!isShopPage && (
              <div className="hidden md:flex items-center gap-8">
                {["Home", "About", "Features", "How it Works"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, "-"))}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isShopPage && onGeneralMenuClick && (
              <button
                onClick={onGeneralMenuClick}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open general menu"
              >
                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            {isShopPage ? (
              <div className="relative cursor-pointer group hidden md:block" onClick={onCartClick}>
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <History className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-900">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm transition-all shadow-none hover:shadow-md"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
