import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft, UploadCloud, FileText, Download, Trash2, Loader2, HardDrive } from "lucide-react"

function Uploads() {
    const navigate = useNavigate()
    const { projectId } = useParams()

    const [project, setProject] = useState(null)
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    useEffect(() => {
        fetchProject()
        fetchDocuments()
    }, [projectId])

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${projectId}`)
            setProject(res.data)
        } catch (error) {
            console.error(error)
            navigate("/home")
        }
    }

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/projects/${projectId}/documents/`)
            setDocuments(response.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (file) => {
        if (!file) return

        const allowed = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        ]

        if (!allowed.includes(file.type)) {
            alert("Only PDF and DOCX files are allowed")
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        setUploading(true)

        try {
            const response = await api.post(`/projects/${projectId}/documents/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            setDocuments([response.data, ...documents])
        } catch (error) {
            console.error(error)
            alert("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const handleFileInput = (e) => {
        const file = e.target.files[0]
        handleUpload(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        handleUpload(file)
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this document securely?")) return
        try {
            await api.delete(`/projects/${projectId}/documents/${id}`)
            setDocuments(documents.filter(d => d.id !== id))
        } catch (error) {
            console.error(error)
            alert("Failed to delete document")
        }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 transition-colors duration-300 relative overflow-x-hidden py-6">
            
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                
                <header className="flex items-center justify-between mb-10 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <button
                        onClick={() => navigate(`/project/${projectId}`)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Chat
                    </button>
                    
                    <h1 className="text-sm font-extrabold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md" title={project?.project_name}>
                        {project?.project_name || "Syncing Knowledge Base..."}
                    </h1>
                </header>

                <main className="space-y-10">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Document Library
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Upload documents to build your workspace knowledge base and enable intelligent search and retrieval.
                        </p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 backdrop-blur-md relative overflow-hidden flex flex-col items-center justify-center ${
                            dragOver
                                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-lg shadow-blue-500/5"
                                : "border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 shadow-sm"
                        }`}
                    >
                        <div className={`p-4 rounded-xl border mb-4 transition-colors ${dragOver ? "bg-white dark:bg-gray-900 border-blue-400 text-blue-500" : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-400"}`}>
                            {uploading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            ) : (
                                <UploadCloud className="w-6 h-6" />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            {uploading ? "Processing documents..." : "Drag and drop document here"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                            Supports PDF or DOCX up to 10MB
                        </p>

                        <label className={`bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all active:scale-98 select-none ${uploading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                            {uploading ? "Uploading..." : "Browse Local File"}
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileInput}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200/40 dark:border-gray-800/40">
                            <HardDrive className="w-4 h-4 text-gray-400" />
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Document Stores ({documents.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400 py-4 font-medium">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                Processing documents...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-12 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                    No documents have been added to this workspace yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 relative"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border ${
                                                    doc.file_type?.toLowerCase() === "pdf"
                                                        ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/40 dark:border-red-900/40"
                                                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/40 dark:border-blue-900/40"
                                                }`}>
                                                    {doc.file_type || "DOC"}
                                                </span>
                                                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                                                    {formatSize(doc.file_size)}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={doc.original_name}>
                                                    {doc.original_name}
                                                </h4>
                                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                                    Ingested {formatDate(doc.upload_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                                            <a
                                                href={`http://127.0.0.1:8000/projects/${projectId}/documents/download/${doc.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                                                title="Download Source File"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                                                title="Purge Document Vector"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    )
}

export default Uploads