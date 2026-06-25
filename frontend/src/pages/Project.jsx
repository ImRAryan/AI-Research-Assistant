import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../services/api"
import { 
    FolderOpen, 
    Settings as SettingsIcon, 
    LogOut, 
    LayoutDashboard,
    ChevronRight,
    FolderPlus,
    Trash2,
    Briefcase,
    Plus,
    X,
    FileText
} from "lucide-react"

function Project() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [creating, setCreating] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Fallback user state structure for matching the header profile badge
    const [user] = useState({
        name: "Alex Mercer", 
        email: "alex@axoryn.ai",
        avatar: "" 
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects/")
            setProjects(response.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newName.trim()) {
            alert("Please enter a project name")
            return
        }
        setActionLoading(true)
        try {
            const response = await api.post("/projects/", {
                project_name: newName,
                description: newDesc,
            })
            setProjects([response.data, ...projects])
            setNewName("")
            setNewDesc("")
            setCreating(false)
        } catch (error) {
            console.error(error)
            alert("Failed to create project")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation() // Prevent click-through behaviors if cards become linked later
        if (!confirm("Delete this project?")) return
        try {
            await api.delete(`/projects/${id}`)
            setProjects(projects.filter(w => w.id !== id))
        } catch (error) {
            console.error(error)
            alert("Failed to delete project")
        }
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                                location.pathname === "/projects" || location.pathname === "/home"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Workspaces
                        </button>

                        <button
                            onClick={() => navigate("/all-documents")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                                location.pathname === "/all-documents" 
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                            location.pathname === "/settings" 
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
                
                {/* Profile Top Bar Header Container */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between md:justify-end items-center transition-all">
                    {/* Mobile Only Brand Indicator */}
                    <div className="flex items-center gap-2 md:hidden">
                        <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-black text-xs">A</span>
                        </span>
                        <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">Axoryn</h1>
                    </div>

                    {/* Active State Premium Profile Interactive Badge */}
                    <div 
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
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

                {/* Main Workspace / Projects Engine Canvas */}
                <main className="px-6 lg:px-10 py-10 max-w-7xl w-full mx-auto flex-1 relative z-10">
                    
                    {/* Core Header Elements */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Project Engine Workspaces
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Initialize high-performance environments to handle document extractions and contextual AI layers.
                            </p>
                        </div>
                        <button
                            onClick={() => setCreating(!creating)}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer self-start sm:self-auto"
                        >
                            {creating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {creating ? "Close Panel" : "New Workspace"}
                        </button>
                    </div>

                    {/* Inline Create Form Drawer */}
                    {creating && (
                        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 p-6 rounded-2xl shadow-md mb-8 max-w-xl animate-in slide-in-from-top-4 duration-200">
                            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                                <FolderPlus className="w-5 h-5" />
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Initialize Project Node</h2>
                            </div>
                            
                            <div className="space-y-3.5">
                                <input
                                    type="text"
                                    placeholder="Project reference name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Context scope description (optional)"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <div className="flex gap-2.5 pt-1">
                                    <button
                                        onClick={handleCreate}
                                        disabled={actionLoading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {actionLoading ? "Deploying..." : "Deploy Workspace"}
                                    </button>
                                    <button
                                        onClick={() => setCreating(false)}
                                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/80 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rendering Layer: Main Dynamic Project Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-400 font-medium tracking-wide">Syncing active environments...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-16 text-center max-w-md mx-auto flex flex-col items-center gap-4 mt-10">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-600">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">No nodes active</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                                    There are currently no active workspace parameters registered to this account framework.
                                </p>
                            </div>
                            <button
                                onClick={() => setCreating(true)}
                                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                            >
                                Setup First Node
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                            {projects.map((w) => (
                                <div
                                    key={w.id}
                                    className="group backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 flex flex-col gap-3 transition-all duration-200 relative overflow-hidden"
                                >
                                    {/* Top Workspace Accent Line */}
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500 transition-all duration-300"></div>

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(w.id, e)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Terminate Project Node"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 mt-1">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {w.project_name}
                                        </h2>
                                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
                                            {w.description || "No unique parameters details initialized for this engine instance."}
                                        </p>
                                    </div>

                                    {/* Footer Node Data Indicator */}
                                    <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        <FileText className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                        Context Isolated
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

export default Project