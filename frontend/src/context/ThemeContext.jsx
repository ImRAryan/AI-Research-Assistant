import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light"
    })

    const [showCitations, setShowCitations] = useState(() => {
        const stored = localStorage.getItem("showCitations")
        return stored === null ? true : stored === "true"
    })

    useEffect(() => {
        localStorage.setItem("theme", theme)
        if (theme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [theme])

    useEffect(() => {
        localStorage.setItem("showCitations", showCitations)
    }, [showCitations])

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light")
    }

    const toggleCitations = () => {
        setShowCitations(prev => !prev)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, showCitations, setShowCitations, toggleCitations }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}