import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { Sun, Moon, ArrowLeft } from "lucide-react"

function Settings() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

            <nav className="flex items-center justify-between px-10 py-5 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <button
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <div className="w-16"></div>
            </nav>

            <div className="max-w-2xl mx-auto px-10 py-10">

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Appearance
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Choose how AxorynAI looks to you
                    </p>

                    <div className="flex gap-4">

                        <button
                            onClick={() => setTheme("light")}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                                theme === "light"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <Sun className={`w-8 h-8 ${theme === "light" ? "text-blue-600" : "text-gray-400"}`} />
                            <span className={`font-medium ${theme === "light" ? "text-blue-600" : "text-gray-600 dark:text-gray-300"}`}>
                                Light
                            </span>
                        </button>

                        <button
                            onClick={() => setTheme("dark")}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                                theme === "dark"
                                    ? "border-blue-500 bg-gray-700"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <Moon className={`w-8 h-8 ${theme === "dark" ? "text-blue-400" : "text-gray-400"}`} />
                            <span className={`font-medium ${theme === "dark" ? "text-blue-400" : "text-gray-600 dark:text-gray-300"}`}>
                                Dark
                            </span>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Settings