import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

function applyTheme(theme: "dark" | "light") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "light"
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl glass-subtle hover:bg-[rgb(var(--color-glass-hover)/0.5)] transition-all duration-200 focus-ring group"
      aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 text-[rgb(var(--color-accent))] transition-all duration-300 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 text-[rgb(var(--color-primary))] transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  )
}
