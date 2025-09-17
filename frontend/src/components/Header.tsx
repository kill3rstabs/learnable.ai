import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b transition-all",
        "bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl",
        scrolled
          ? "shadow-[0_8px_24px_rgba(2,6,23,0.08)] border-emerald-600/15"
          : "shadow-none border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="flex h-14 sm:h-[60px] items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/hopenote-logo.png"
              alt="Hopnote"
              className="h-8 w-10 md:h-8 md:w-10 object-contain transition-transform duration-200 group-hover:scale-[1.22]"
            />
            <div className="leading-none">
              <img
                src="/hopnote-text-logo.png"
                alt="Hopnote"
                className="h-6 w-auto object-contain mt-2"
              />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isHome && (
             <Button
             size="sm"
             onClick={() => navigate("/login")}
             className="group relative inline-flex items-center justify-center rounded-3xl px-5
                        bg-emerald-600 text-white font-normal hover:bg-emerald-600/95
                        transition-colors duration-200 focus:outline-none"
           >
             <span
               className="buttonTicker select-none"
               data-label="Get Started"
             >
               <span className="line">Get Started</span>
             </span>
           </Button>
           
            )}
          </div>
        </div>
      </div>
      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
    </header>
  );
};

export default Header;
