import { useState } from "react";
import { Moon, Sun, Download, Upload, LayoutGrid, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { WeatherWidget } from "@/components/WeatherWidget";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: "dashboard" | "timeline";
  onViewChange: (view: "dashboard" | "timeline") => void;
}

export function Header({ searchQuery, onSearchChange, currentView, onViewChange }: HeaderProps) {
  const { darkMode, toggleDarkMode, exportData, importData } = useApp();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        try {
          const text = await file.text();
          importData(text);
        } catch (error) {
          alert("Error importing file. Please check the file format.");
        } finally {
          setIsImporting(false);
        }
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo/Title & Weather */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block">
                My Project OS
              </h1>
            </div>
            <div className="hidden lg:block">
              <WeatherWidget />
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-4">
            <Input
              type="search"
              placeholder="Search tiles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
              data-testid="input-search"
            />
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("dashboard")}
              title="Dashboard View"
              data-testid="button-view-dashboard"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={currentView === "timeline" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewChange("timeline")}
              title="Timeline View"
              data-testid="button-view-timeline"
            >
              <Clock className="w-5 h-5" />
            </Button>

            {/* Export/Import */}
            <Button
              variant="ghost"
              size="icon"
              onClick={exportData}
              title="Export Data"
              data-testid="button-export"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleImport}
              disabled={isImporting}
              title="Import Data"
              data-testid="button-import"
            >
              <Upload className="w-5 h-5" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              title={darkMode ? "Light Mode" : "Dark Mode"}
              data-testid="button-theme-toggle"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
