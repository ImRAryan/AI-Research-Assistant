import { Plus, Trash2, MessageSquare, ArrowLeft, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import ReactMarkdown from "react-markdown"

function Dashboard() {

    const navigate = useNavigate()
    const { projectId } = useParams()

    const [project, setProject] = useState(null)
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [chats, setChats] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const [messages, setMessages] = useState([])
    const [streamingText, setStreamingText] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [hasDocuments, setHasDocuments] = useState(true) // assume true until checked
    const [checkingDocs, setCheckingDocs] = useState(true)

    useEffect(() => {
        fetchProject()
        fetchChats()
        checkDocuments()
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

    return (

        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

            {/* Sidebar */}
            <div className="w-64 bg-gray-900 dark:bg-black text-white flex flex-col">

                <div className="px-5 py-5 border-b border-gray-700">
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        All Projects
                    </button>
                    <h1 className="text-lg font-bold truncate">{project?.project_name || "Loading..."}</h1>
                </div>

                <div className="px-4 py-4">
                    <button
                        onClick={handleNewChat}
                        className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3">
                    <p className="text-gray-400 text-xs px-2 mb-2 uppercase tracking-wide">
                        Recent Chats
                    </p>
                    {chats.length === 0 ? (
                        <p className="text-gray-500 text-sm px-2">No chats yet</p>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => loadChat(chat.id)}
                                className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer mb-1 group ${activeChatId === chat.id
                                    ? "bg-gray-700"
                                    : "hover:bg-gray-800"
                                    }`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-sm text-gray-200 truncate">
                                        {chat.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 shrink-0 ml-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t border-gray-700 px-4 py-4 flex flex-col gap-2">
                    <button
                        onClick={() => navigate("/settings")}
                        className="text-gray-300 hover:text-white text-sm text-left px-2 py-1"
                    >
                        ⚙️ Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 text-sm text-left px-2 py-1"
                    >
                        🚪 Logout
                    </button>
                </div>

            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">

                <nav className="flex items-center justify-end px-10 py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
                    <button
                        onClick={() => navigate(`/project/${projectId}/uploads`)}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2 rounded-xl text-sm"
                    >
                        Uploads
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm"
                    >
                        Profile
                    </button>
                </nav>

                {checkingDocs ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400">Loading...</p>
                    </div>
                ) : !hasDocuments ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-10">
                        <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Upload a document to get started
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                            This project doesn't have any documents yet. Upload at least one PDF or DOCX file before you can start chatting.
                        </p>
                        <button
                            onClick={() => navigate(`/project/${projectId}/uploads`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                        >
                            Go to Uploads
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-10 py-8">

                            {messages.length === 0 && !isStreaming ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <h1 className="text-5xl font-bold text-center leading-tight text-gray-800 dark:text-gray-100">
                                        Research anything with
                                        <span className="text-blue-600 dark:text-blue-400"> AxorynAI</span>
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-xl mt-6 text-center max-w-2xl">
                                        Ask questions about the documents uploaded in this project
                                    </p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-xl px-5 py-4 rounded-2xl ${msg.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-md"
                                                }`}>
                                                {msg.role === "assistant" ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p>{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl shadow-md max-w-xl">
                                                <span className="flex gap-1 items-center">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isStreaming && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl shadow-md max-w-xl">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                                                </div>
                                                <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        <div className="px-10 py-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                            <div className="max-w-3xl mx-auto flex items-center gap-4">

                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-4 flex-1">
                                    <input
                                        type="text"
                                        placeholder="Ask anything about your documents..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleResearch()}
                                        className="w-full outline-none text-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        disabled={loading || isStreaming}
                                    />
                                </div>

                                <button
                                    onClick={handleResearch}
                                    disabled={loading || isStreaming}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold disabled:opacity-50"
                                >
                                    {loading || isStreaming ? "..." : "Send"}
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