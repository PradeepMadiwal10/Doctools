import { Link } from "react-router-dom";
import { FileText, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";





const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState("light");

useEffect(() => {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  document.documentElement.classList.toggle("dark", savedTheme === "dark");
}, []);

const toggleTheme = () => {
  const newTheme = theme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  localStorage.setItem("theme", newTheme);
  document.documentElement.classList.toggle("dark", newTheme === "dark");
};

  const handleScrollToAbout = () => {
    setTimeout(() => {
      const el = document.getElementById("about");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleScrollToTools = () => {
  setTimeout(() => {
    const el = document.getElementById("tools");
    el?.scrollIntoView({ behavior: "smooth" });
  }, 100);
};

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="section-container">

        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">
                DocTools
              </span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-0.5 hidden sm:block">
                Free Document Tools
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {/* Right Side */}
<div className="flex items-center gap-2">

  {/* Desktop Nav */}
  <nav className="hidden items-center gap-1 md:flex">
    <Link
      to="/"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
    >
      Home
    </Link>

    <Link
      to="/"
      onClick={handleScrollToTools}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
    >
      All Tools
    </Link>

    <Link
      to="/"
      onClick={handleScrollToAbout}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
    >
      About
    </Link>
  </nav>

  {/* Theme Toggle */}
  <button
    onClick={toggleTheme}
    className="p-2 rounded-lg hover:bg-muted transition hidden md:flex"
  >
    {theme === "dark" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    )}
  </button>

  {/* Mobile Menu Button */}
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  >
    {isMobileMenuOpen ? (
      <X className="h-5 w-5" />
    ) : (
      <Menu className="h-5 w-5" />
    )}
  </Button>

</div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-1">

              <Link
  to="/"
  onClick={() => {
    setIsMobileMenuOpen(false);
    handleScrollToTools();
  }}
  className="px-4 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-muted"
>
  All Tools
</Link>

              <Link
                to="/"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleScrollToAbout();
                }}
                className="px-4 py-3 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted"
              >
                About
              </Link>

            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;