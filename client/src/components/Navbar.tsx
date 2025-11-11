import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface NavbarProps {
  isShopPage?: boolean;
  cartItemCount?: number;
}

const Navbar = ({ isShopPage = false, cartItemCount = 0 }: NavbarProps) => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b-2 border-white/60 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <img 
                src={logo} 
                alt="Legit Store Logo" 
                className="h-12 w-auto object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div 
              className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300"
              style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
            >
              Legit Store
            </div>
          </div>

          <div className="flex items-center gap-8">
            {!isShopPage && (
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => scrollToSection("home")}
                  className="relative text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold text-lg group"
                >
                  <span>Home</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="relative text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold text-lg group"
                >
                  <span>About</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="relative text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold text-lg group"
                >
                  <span>Features</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="relative text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold text-lg group"
                >
                  <span>How it Works</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isShopPage ? (
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-6 w-6 text-white" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
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
