import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Hand,
  Menu,
  X,
  Sparkles,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import gsap from "gsap";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([logoRef.current, linksRef.current, authRef.current], {
        opacity: 0,
        y: -20,
      });

      // Create timeline
      const tl = gsap.timeline({ delay: 0.1 });

      // Animate navbar elements
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      })
        .to(
          linksRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        )
        .to(
          authRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4",
        );

      // Logo hover animation
      const logo = logoRef.current;
      if (logo) {
        logo.addEventListener("mouseenter", () => {
          gsap.to(logo.querySelector(".logo-icon"), {
            rotation: 360,
            duration: 0.6,
            ease: "power2.out",
          });
          gsap.to(logo.querySelector(".logo-text"), {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        logo.addEventListener("mouseleave", () => {
          gsap.to(logo.querySelector(".logo-text"), {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }

      // Sparkle animation for premium badge
      gsap.to(".premium-sparkle", {
        rotation: 180,
        scale: 1.1,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  // Navigation links (always visible - no authentication required)
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/palm-analysis", label: "Palm Reading" },
    { path: "/numerology", label: "Numerology" },
    { path: "/astrology", label: "Astrology" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  // Allow other components/pages to open the auth modal via a global event
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuthModal);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500
          ${scrolled ? "border-b border-border/50 backdrop-blur-md bg-background/80" : "bg-transparent border-none backdrop-blur-0"}`}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 md:h-20 py-3 md:py-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <div ref={logoRef} className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative">
                  <Hand className="logo-icon h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-400" />
                  <Sparkles className="premium-sparkle absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 text-amber-400" />
                </div>
                <span className="logo-text text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  PalmAstro
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div
              ref={linksRef}
              className="hidden md:flex items-center space-x-8"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium transition-all duration-200 ease-in-out hover:text-purple-400 hover:scale-105 ${
                    isActive(link.path)
                      ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                      : "text-gray-200"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div ref={authRef} className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-cosmic/20 text-cosmic">
                            {user.first_name?.[0] || user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 glass-card border-cosmic/20"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-muted-foreground hover:text-yellow-300"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-stellar-gradient hover:opacity-90 stellar-glow"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-0.5 border-t border-border/50 bg-background/95 backdrop-blur-sm max-h-[calc(100vh-4rem)] overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out hover:text-purple-400 rounded-lg touch-manipulation ${
                      isActive(link.path)
                        ? "text-purple-400 bg-purple-500/10"
                        : "text-gray-300"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="pt-3 pb-2 border-t border-border/50">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center px-3 py-2">
                        <Avatar className="h-9 w-9 mr-2.5 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-cosmic/20 text-cosmic text-xs">
                            {user.first_name?.[0] || user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-cosmic touch-manipulation"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 px-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-cosmic/50 text-cosmic hover:bg-cosmic/20 hover:text-yellow-300 touch-manipulation"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-stellar-gradient hover:opacity-90 stellar-glow touch-manipulation"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
