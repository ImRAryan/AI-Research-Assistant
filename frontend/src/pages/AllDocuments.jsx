import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft, FileText } from "lucide-react"

function AllDocuments() {

    const navigate = useNavigate()
    const [documents, setDocuments] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState("")

    useEffect(() => {
        fetchProjects()
        fetchDocuments()
    }, [])

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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Documents</h1>
                <div className="w-16"></div>
            </nav>

            <div className="px-10 py-10 max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Documents across all projects
                    </h2>

                    <select
                        value={selectedProject}
                        onChange={handleFilterChange}
                        className="border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl"
                    >
                        <option value="">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.project_name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No documents found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => navigate(`/project/${doc.project_id}`)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${doc.file_type === "pdf"
                                    ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                                    : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                    }`}>
                                    {doc.file_type.toUpperCase()}
                                </div>

                                <h2 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">
                                    {doc.original_name}
                                </h2>

                                <p className="text-blue-500 dark:text-blue-400 text-sm font-medium">
                                    📁 {getProjectName(doc.project_id)}
                                </p>

                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {formatSize(doc.file_size)} • {formatDate(doc.upload_date)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>

    )

}

export default AllDocuments