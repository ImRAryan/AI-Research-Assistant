import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft } from "lucide-react"

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

        const allowed = ["application/pdf",
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
            alert("File uploaded successfully!")
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
        if (!confirm("Delete this document?")) return
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

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

            <nav className="flex justify-between items-center px-10 py-5 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <button
                    onClick={() => navigate(`/project/${projectId}`)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Chat
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {project?.project_name || "Loading..."}
                </h1>
                <div className="w-32"></div>
            </nav>

            <div className="px-10 py-10 max-w-6xl mx-auto">

                <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Project Documents</h1>

                {/* Upload Area */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center mb-10 transition-colors ${dragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                >
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                        Drag and drop your PDF or DOCX file here
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 mb-6">or</p>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer">
                        {uploading ? "Uploading..." : "Browse File"}
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileInput}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-4">Max file size: 10MB</p>
                </div>

                {/* Documents List */}
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                ) : documents.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet in this project.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col gap-2"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${doc.file_type === "pdf"
                                        ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                                        : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                        }`}>
                                        {doc.file_type.toUpperCase()}
                                    </div>
                                </div>

                                <h2 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">
                                    {doc.original_name}
                                </h2>

                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {formatSize(doc.file_size)}
                                </p>

                                <p className="text-gray-400 dark:text-gray-500 text-sm">
                                    {formatDate(doc.upload_date)}
                                </p>

                                <div className="flex gap-3 mt-3 flex-wrap">
                                    <a href={`http://127.0.0.1:8000/projects/${projectId}/documents/download/${doc.id}`}
                                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                                    >
                                        Download
                                    </a>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>

    )

}

export default Uploads