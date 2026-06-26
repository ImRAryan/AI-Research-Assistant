import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../services/api"
import {
    FileText,
    FolderOpen,
    Settings as SettingsIcon,
    LogOut,
    LayoutDashboard,
    ChevronRight,
    SlidersHorizontal
} from "lucide-react"

function AllDocuments() {
    const navigate = useNavigate()
    const location = useLocation()

    const [documents, setDocuments] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState("")

    // Fallback user state structure for the profile badge
    const [user, setUser] = useState({ name: "", email: "", avatar_url: "" })

    useEffect(() => {
        fetchProjects()
        fetchDocuments()
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

    const fetchProjects = async () => {
        try {
            const res = await api.get("/projects/")
            setProjects(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchDocuments = async (projectId = "") => {
        setLoading(true)
        try {
            const url = projectId
                ? `/documents/all?project_id=${projectId}`
                : "/documents/all"
            const res = await api.get(url)
            setDocuments(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const projectId = e.target.value
        setSelectedProject(projectId)
        fetchDocuments(projectId)
    }

    const getProjectName = (projectId) => {
        const p = projects.find(p => p.id === projectId)
        return p ? p.project_name : "Unknown project"
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        })
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        navigate("/")
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 flex transition-colors duration-300 relative overflow-x-hidden">

            {/* Ambient Background Glow System */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Left Sidebar Frame */}
            <aside className="w-64 fixed h-screen top-0 left-0 hidden md:flex flex-col justify-between backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-r border-gray-200/50 dark:border-gray-800/50 p-6 z-50">
                <div className="space-y-8">
                    {/* Brand Identifier */}
                    <div className="flex items-center gap-3 px-2">
                        <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <span className="text-white font-black text-xs">A</span>
                        </span>
                        <h1 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white cursor-default">
                            Axoryn<span className="text-blue-600 dark:text-blue-400">AI</span>
                        </h1>
                    </div>

                    {/* Navigation Menu Links */}
                    <div className="space-y-1.5">
                        <p className="px-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Main Core</p>

                        <button
                            onClick={() => navigate("/home")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/home"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Workspaces
                        </button>

                        <button
                            onClick={() => navigate("/all-documents")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/all-documents"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <FolderOpen className="w-4 h-4" />
                            All Documents
                        </button>
                    </div>
                </div>

                {/* Bottom Control Segment */}
                <div className="space-y-1">
                    <button
                        onClick={() => navigate("/settings")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/settings"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-medium transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        System Logout
                    </button>
                </div>
            </aside>

            {/* Content Hub Wrapper */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

                {/* Enhanced Dynamic Profile Top Bar Container */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between md:justify-end items-center transition-all">
                    {/* Mobile Only Brand Indicator */}
                    <div className="flex items-center gap-2 md:hidden">
                        <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-black text-xs">A</span>
                        </span>
                        <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">Axoryn</h1>
                    </div>

                    {/* Premium Profile Interactive Badge */}
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

                {/* Main Dynamic Viewport Document Canvas */}
                <main className="px-6 lg:px-10 py-10 max-w-5xl w-full mx-auto flex-1 relative z-10">

                    {/* Header Filters Module */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                All Documents
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                                Review and manage centralized file systems extracted across workspace instances.
                            </p>
                        </div>

                        {/* Styled Project Selector Filter Dropdown */}
                        <div className="relative flex items-center self-start sm:self-center">
                            <SlidersHorizontal className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedProject}
                                onChange={handleFilterChange}
                                className="pl-10 pr-10 py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none"
                            >
                                <option value="">All Project Workspaces</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.project_name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400 dark:border-t-gray-500 w-0 h-0"></div>
                        </div>
                    </div>

                    {/* Content Logic Pipeline */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">Retrieving Index...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-800 text-center py-20 rounded-2xl max-w-xl mx-auto">
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700">
                                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No documents indexed</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs mx-auto">
                                There are no files loaded inside this scope. Initialize a project card to append vector stores.
                            </p>
                        </div>
                    ) : (
                        /* Document Cards Layout */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate(`/project/${doc.project_id}`)}
                                    className="group relative backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-xl dark:hover:shadow-blue-500/[0.01] hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <div className="space-y-3">
                                        {/* Dynamic File Extension Pill */}
                                        <div className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg w-fit ${doc.file_type === "pdf"
                                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-900/30"
                                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/30"
                                            }`}>
                                            {doc.file_type || "DOC"}
                                        </div>

                                        <h2 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                            {doc.original_name}
                                        </h2>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1">
                                        <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold truncate group-hover:underline">
                                            📁 {getProjectName(doc.project_id)}
                                        </p>
                                        <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium">
                                            {formatSize(doc.file_size)} • {formatDate(doc.upload_date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default AllDocuments