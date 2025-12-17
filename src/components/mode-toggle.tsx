import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      {theme === "dark" ? (
        <Button
          variant={"outline"}
          className="hover:text-white"
          size={"icon"}
          onClick={() => setTheme("light")}
        >
          <Sun />
        </Button>
      ) : (
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => setTheme("dark")}
        >
          <Moon />
        </Button>
      )}
    </div>
  );
}
