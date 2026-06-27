import { Plus, Trash2, MessageSquare, ArrowLeft, Upload, Settings, LogOut, ChevronRight, Send, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import api from "../services/api"
import ReactMarkdown from "react-markdown"

function Dashboard() {
    const navigate = useNavigate()
    const { projectId } = useParams()
    const { showCitations } = useTheme()

    const [project, setProject] = useState(null)
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [chats, setChats] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const [messages, setMessages] = useState([])
    const [streamingText, setStreamingText] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [hasDocuments, setHasDocuments] = useState(true)
    const [checkingDocs, setCheckingDocs] = useState(true)

    // Fallback user state structure for the profile badge
    const [user, setUser] = useState({ name: "", email: "", avatar_url: "" })

    useEffect(() => {
        fetchProject()
        fetchChats()
        fetchUser()
        checkDocuments()
    }, [projectId])

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me")
            setUser(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${projectId}`)
            setProject(res.data)
        } catch (error) {
            console.error(error)
            navigate("/home")
        }
    }

    const checkDocuments = async () => {
        try {
            const res = await api.get(`/projects/${projectId}/documents/`)
            setHasDocuments(res.data.length > 0)
        } catch (error) {
            console.error(error)
        } finally {
            setCheckingDocs(false)
        }
    }

    const fetchChats = async () => {
        try {
            const res = await api.get(`/projects/${projectId}/chats/`)
            setChats(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const loadChat = async (chatId) => {
        try {
            const res = await api.get(`/projects/${projectId}/chats/${chatId}`)
            setActiveChatId(chatId)
            setMessages(res.data.messages)
        } catch (error) {
            console.error(error)
        }
    }

    const handleNewChat = () => {
        setActiveChatId(null)
        setMessages([])
        setQuery("")
    }

    const handleResearch = async () => {
        if (!query.trim()) {
            alert("Please enter a question")
            return
        }

        const userQuestion = query
        setQuery("")

        const tempUserMessage = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: userQuestion,
        }
        setMessages(prev => [...prev, tempUserMessage])

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("question", userQuestion)
            if (activeChatId) formData.append("chat_id", activeChatId)

            const res = await api.post(`/projects/${projectId}/chats/ask`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            const allMessages = res.data.messages
            const aiMessage = allMessages[allMessages.length - 1]

            setActiveChatId(res.data.id)
            setMessages(allMessages.slice(0, -1))
            fetchChats()

            setLoading(false)
            setIsStreaming(true)
            setStreamingText("")

            const words = aiMessage.content.split(" ")
            let current = ""

            for (let i = 0; i < words.length; i++) {
                current += (i === 0 ? "" : " ") + words[i]
                setStreamingText(current)
                await new Promise(r => setTimeout(r, 25))
            }

            setIsStreaming(false)
            setStreamingText("")
            setMessages(allMessages)

        } catch (error) {
            console.error(error)
            const errorMsg = error.response?.data?.detail || "Something went wrong"
            alert(errorMsg)
            setLoading(false)
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
        }
    }

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation()
        if (!confirm("Delete this chat?")) return
        try {
            await api.delete(`/projects/${projectId}/chats/${chatId}`)
            setChats(chats.filter(c => c.id !== chatId))
            if (activeChatId === chatId) {
                setActiveChatId(null)
                setMessages([])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        navigate("/")
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    const formatMessageContent = (content) => {
        if (showCitations) return content

        // Remove anything from "SOURCE:" or "**Sources:**" onward (case-insensitive)
        return content.replace(/(\n*\s*(SOURCE:|sources:|\*\*Sources:\*\*)[\s\S]*)/i, "").trim()
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 transition-colors duration-300 relative overflow-hidden">

            {/* Ambient Background Glow System */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Left Sidebar Frame (Contextual Chat Panel) */}
            <aside className="w-64 fixed h-screen top-0 left-0 hidden md:flex flex-col justify-between backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-r border-gray-200/50 dark:border-gray-800/50 p-4 z-50">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Upper Workspace Nav Control */}
                    <div className="pb-4 mb-2 border-b border-gray-200/50 dark:border-gray-800/50">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-xs transition-colors cursor-pointer group mb-3"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            All Workspaces
                        </button>
                        <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white truncate" title={project?.project_name}>
                            {project?.project_name || "Syncing Node..."}
                        </h1>
                    </div>

                    {/* New Chat Deployment Core */}
                    <div className="py-2">
                        <button
                            onClick={handleNewChat}
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </button>
                    </div>

                    {/* Recent Dynamic Chat Sessions Streams */}
                    <div className="flex-1 overflow-y-auto px-1 mt-4 space-y-1 scrollbar-thin">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5 px-2">
                            Recent Chats
                        </p>
                        {chats.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-600 text-xs italic px-2 py-1">No execution logs found.</p>
                        ) : (
                            chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => loadChat(chat.id)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer group transition-all text-sm font-medium ${activeChatId === chat.id
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <MessageSquare className={`w-4 h-4 shrink-0 ${activeChatId === chat.id ? "text-blue-500" : "text-gray-400"}`} />
                                        <span className="truncate pr-1">{chat.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 shrink-0 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bottom System Utilities Configuration */}
                <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-3 space-y-0.5">
                    <button
                        onClick={() => navigate("/settings")}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Content Hub Wrapper */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen overflow-hidden">

                {/* Profile Top Bar Header Container */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-b-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between items-center transition-all">
                    {/* Header Action Routing Triggers */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/project/${projectId}/uploads`)}
                            className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Documents
                        </button>
                    </div>

                    {/* Active State Premium Profile Interactive Badge */}
                    <div
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/10" />
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

                {/* Sub-canvas Execution Pipeline Layer */}
                {checkingDocs ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 border-blue-600 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-400 font-medium tracking-wide">Analyzing knowledge graphs...</p>
                    </div>
                ) : !hasDocuments ? (
                    /* Zero State Content Vector Block */
                    <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-sm rounded-2xl text-blue-500">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    No Resources Added Yet
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
                                    Add at least one PDF or DOCX file to provide context for this workspace.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/project/${projectId}/uploads`)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all active:scale-98 cursor-pointer mt-2"
                            >
                                Upload Documents
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Main Operational Chat Engine Interface Hub */
                    <>
                        {/* Dynamic Message Scroll Feed Container */}
                        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 space-y-6 scrollbar-thin">
                            {messages.length === 0 && !isStreaming ? (
                                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center relative z-10 animate-in fade-in duration-300">
                                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                        Research Workspace
                                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                                            AxorynAI Research Hub
                                        </span>
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-4 max-w-lg mx-auto leading-relaxed">
                                        Interact with your workspace knowledge through intelligent search and retrieval.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto flex flex-col gap-5 relative z-10">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                                        >
                                            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed font-medium ${msg.role === "user"
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/5 rounded-tr-none"
                                                : "backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 text-gray-800 dark:text-gray-200 shadow-sm rounded-tl-none"
                                                }`}>
                                                {msg.role === "assistant" ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 prose-headings:font-bold prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-gray-950/60 prose-pre:border dark:prose-pre:border-gray-800">
                                                        <ReactMarkdown>{formatMessageContent(msg.content)}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Thinking Status Block */}
                                    {loading && (
                                        <div className="flex justify-start animate-in fade-in duration-200">
                                            <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Dynamic Core Text Token Stream Card */}
                                    {isStreaming && (
                                        <div className="flex justify-start">
                                            <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm leading-relaxed font-medium">
                                                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                                                    <ReactMarkdown>{formatMessageContent(streamingText)}</ReactMarkdown>
                                                </div>
                                                <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Prompt Input Control Hub Footer */}
                        <div className="px-6 lg:px-10 py-6 backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border-t border-gray-200/50 dark:border-gray-800/50 relative z-20">
                            <div className="max-w-3xl mx-auto flex items-center gap-3">

                                <div className="flex items-center backdrop-blur-md bg-white/90 dark:bg-gray-800/50 border border-gray-300/60 dark:border-gray-700/60 rounded-2xl px-4 py-3 flex-1 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
                                    <input
                                        type="text"
                                        placeholder="Ask anything about your documents..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !loading && !isStreaming && handleResearch()}
                                        className="w-full outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium pr-2"
                                        disabled={loading || isStreaming}
                                    />
                                </div>

                                <button
                                    onClick={handleResearch}
                                    disabled={loading || isStreaming || !query.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-800/80 disabled:text-gray-400 text-white p-3.5 rounded-2xl shadow-md shadow-blue-500/10 active:scale-97 disabled:scale-100 font-bold transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4" />
                                </button>

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Dashboard