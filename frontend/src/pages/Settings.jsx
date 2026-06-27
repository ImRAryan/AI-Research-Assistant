import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import api from "../services/api"
import {
    ChevronRight,
    Sun,
    Moon,
    Monitor,
    ArrowLeft,
    Quote,
    AlertTriangle,
    MessageSquareOff,
    FileX,
    FolderX,
    Loader2
} from "lucide-react"

function Settings() {
    const navigate = useNavigate()
    const { theme, setTheme, showCitations, toggleCitations } = useTheme()

    const [user, setUser] = useState({ name: "", email: "", avatar_url: "" })

    const [clearingChats, setClearingChats] = useState(false)
    const [clearingDocs, setClearingDocs] = useState(false)
    const [clearingProjects, setClearingProjects] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null) // "chats" | "documents" | "projects" | null

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

    const handleClearChats = async () => {
        setClearingChats(true)
        try {
            const res = await api.delete("/settings/chats/all")
            alert(res.data.message)
            setConfirmAction(null)
        } catch (error) {
            console.error(error)
            alert("Failed to clear chat history")
        } finally {
            setClearingChats(false)
        }
    }

    const handleClearDocuments = async () => {
        setClearingDocs(true)
        try {
            const res = await api.delete("/settings/documents/all")
            alert(res.data.message)
            setConfirmAction(null)
        } catch (error) {
            console.error(error)
            alert("Failed to delete documents")
        } finally {
            setClearingDocs(false)
        }
    }

    const handleClearProjects = async () => {
        setClearingProjects(true)
        try {
            const res = await api.delete("/settings/projects/all")
            alert(res.data.message)
            setConfirmAction(null)
            navigate("/home")
        } catch (error) {
            console.error(error)
            alert("Failed to delete projects")
        } finally {
            setClearingProjects(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 flex transition-colors duration-300 relative overflow-x-hidden">

            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-1 flex flex-col min-h-screen">

                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>
                    </div>

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

                <main className="px-6 lg:px-10 py-10 max-w-3xl w-full mx-auto flex-1 relative z-10 space-y-6">

                    <div className="mb-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            System Settings
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                            Customize engine behavior, interface layout, and rendering settings to match your workflow and preferences.
                        </p>
                    </div>

                    {/* Appearance */}
                    <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300">

                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-500" /> Interface Appearance
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                                Choose how the AxorynAI workspace rendering layers display on your active screen.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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

                    {/* Chat Preferences */}
                    <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300">

                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Quote className="w-4 h-4 text-blue-500" /> Chat Preferences
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                                Control how AI responses are displayed during research sessions.
                            </p>
                        </div>

                        <button
                            onClick={toggleCitations}
                            className={`w-full flex items-center justify-between gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer active:scale-99 ${showCitations
                                    ? "border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-800 shadow-md shadow-blue-500/[0.03]"
                                    : "border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30 hover:border-gray-300 dark:hover:border-gray-700"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg border transition-colors ${showCitations
                                        ? "bg-blue-50 border-blue-200 text-blue-600"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                                    }`}>
                                    <Quote className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm ${showCitations ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>
                                        Show Citations
                                    </span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                        Display source documents and page numbers with answers
                                    </span>
                                </div>
                            </div>

                            {/* Toggle switch */}
                            <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showCitations ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${showCitations ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-red-200/60 dark:border-red-900/40 p-6 sm:p-8 rounded-2xl shadow-sm space-y-5 animate-in fade-in duration-300">

                        <div>
                            <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Danger Zone
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                                Bulk actions that affect data across every project. These cannot be undone.
                            </p>
                        </div>

                        {/* Clear all chats */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500">
                                    <MessageSquareOff className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm text-gray-800 dark:text-gray-200">Clear All Chat History</span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">Deletes every chat in every project. Documents are kept.</span>
                                </div>
                            </div>
                            {confirmAction === "chats" ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={handleClearChats} disabled={clearingChats} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                                        {clearingChats ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                                    </button>
                                    <button onClick={() => setConfirmAction(null)} className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2 cursor-pointer">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmAction("chats")} className="shrink-0 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Delete all documents */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500">
                                    <FileX className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm text-gray-800 dark:text-gray-200">Delete All Documents</span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">Removes every uploaded file across all projects. Projects and chats are kept.</span>
                                </div>
                            </div>
                            {confirmAction === "documents" ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={handleClearDocuments} disabled={clearingDocs} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                                        {clearingDocs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                                    </button>
                                    <button onClick={() => setConfirmAction(null)} className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2 cursor-pointer">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmAction("documents")} className="shrink-0 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                                    Delete
                                </button>
                            )}
                        </div>

                        {/* Delete all projects */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/50 dark:bg-gray-950/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500">
                                    <FolderX className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block font-bold text-sm text-gray-800 dark:text-gray-200">Delete All Projects</span>
                                    <span className="block text-[11px] font-medium text-gray-400 mt-0.5">Wipes every project, document, and chat. Your account stays active.</span>
                                </div>
                            </div>
                            {confirmAction === "projects" ? (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={handleClearProjects} disabled={clearingProjects} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
                                        {clearingProjects ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm"}
                                    </button>
                                    <button onClick={() => setConfirmAction(null)} className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2 cursor-pointer">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmAction("projects")} className="shrink-0 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                                    Delete
                                </button>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Settings