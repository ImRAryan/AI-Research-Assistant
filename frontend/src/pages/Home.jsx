import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { FileText, Plus, Trash2, FolderOpen, Settings as SettingsIcon } from "lucide-react"

function Home() {

    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [creating, setCreating] = useState(false)

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
        try {
            const response = await api.post("/projects/", {
                project_name: newName,
                description: newDesc,
            })
            setProjects([response.data, ...projects])
            setNewName("")
            setNewDesc("")
            setCreating(false)
            navigate(`/project/${response.data.id}`)
        } catch (error) {
            console.error(error)
            alert("Failed to create project")
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!confirm("Delete this project? This will also delete all its documents and chats.")) return
        try {
            await api.delete(`/projects/${id}`)
            setProjects(projects.filter(p => p.id !== id))
        } catch (error) {
            console.error(error)
            alert("Failed to delete project")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        navigate("/")
    }

    return (

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

            <nav className="flex justify-between items-center px-10 py-5 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AxorynAI</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/all-documents")}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-xl"
                    >
                        <FolderOpen className="w-4 h-4" />
                        All Documents
                    </button>
                    <button
                        onClick={() => navigate("/settings")}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-xl"
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                    >
                        Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-black dark:bg-gray-600 text-white px-5 py-2 rounded-xl"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="px-10 py-10 max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Project Workspaces</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Create a project to start uploading documents and chatting with AI
                        </p>
                    </div>
                    <button
                        onClick={() => setCreating(!creating)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>

                {creating && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">New Project</h2>
                        <input
                            type="text"
                            placeholder="Project name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl mb-3"
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl mb-3"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreate}
                                className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setCreating(false)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No projects yet. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/project/${p.id}`)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{p.project_name}</h2>
                                <p className="text-gray-600 dark:text-gray-400 flex-1">
                                    {p.description || "No description"}
                                </p>
                                <button
                                    onClick={(e) => handleDelete(e, p.id)}
                                    className="mt-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm self-start"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>

    )

}

export default Home