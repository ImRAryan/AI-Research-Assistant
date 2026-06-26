import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import api from "../services/api"
import {
    ChevronRight,
    Sun,
    Moon,
    Monitor,
    ArrowLeft
} from "lucide-react"

function Settings() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()

    const [user, setUser] = useState({ name: "", email: "", avatar_url: "" })

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me")
            setUser(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 flex transition-colors duration-300 relative overflow-x-hidden">

            {/* Ambient Background Glow System */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Content Hub Wrapper (Sidebar margins removed) */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* Profile Top Bar Header Container */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between items-center transition-all">
                    {/* Back Button and Brand Indicator */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-black text-xs">A</span>
                            </span>
                            <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">Axoryn</h1>
                        </div>
                    </div>

                    {/* Active State Premium Profile Interactive Badge */}
                    <div
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/10" />
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-500/20">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                                {user.email}
                            </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                    </div>
                </header>

                {/* Main Settings Canvas */}
                <main className="px-6 lg:px-10 py-10 max-w-3xl w-full mx-auto flex-1 relative z-10">

                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            System Settings
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                            Tailor engine behaviors, interface layouts, and rendering parameters to suit your workflow.
                        </p>
                    </div>

                    {/* Settings Main Framework */}
                    <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300">

                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-500" /> Interface Appearance
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                                Choose how the AxorynAI workspace rendering layers display on your active screen.
                            </p>
                        </div>

                        {/* Interactive Theme Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Light Theme Option Card */}
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer group active:scale-99 ${theme === "light"
                                        ? "border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 shadow-md shadow-blue-500/[0.03]"
                                        : "border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30 hover:border-gray-300 dark:hover:border-gray-700"
                                    }`}
                            >
                                <div className={`p-3 rounded-lg border transition-colors ${theme === "light"
                                        ? "bg-blue-50 border-blue-200 text-blue-600"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                                    }`}>
                                    <Sun className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm ${theme === "light" ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>
                                        Light Theme
                                    </span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                        Clean high-contrast environment
                                    </span>
                                </div>
                            </button>

                            {/* Dark Theme Option Card */}
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer group active:scale-99 ${theme === "dark"
                                        ? "border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 shadow-md shadow-blue-500/[0.03]"
                                        : "border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30 hover:border-gray-300 dark:hover:border-gray-700"
                                    }`}
                            >
                                <div className={`p-3 rounded-lg border transition-colors ${theme === "dark"
                                        ? "bg-blue-950/50 border-blue-900/50 text-blue-400"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                                    }`}>
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm ${theme === "dark" ? "text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                                        Dark Theme
                                    </span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                        Subtle, low-light organic contrast
                                    </span>
                                </div>
                            </button>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Settings