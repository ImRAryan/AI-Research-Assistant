import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, User, Mail, Shield, Save, Loader2, Camera, Key } from "lucide-react"
import api from "../services/api"

function Profile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    
    // Core profile states
    const [profile, setProfile] = useState({
        name: "Alex Mercer",
        email: "alex@axoryn.ai",
        role: "Workspace Administrator",
        joined: "October 2025"
    })

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        // fetchUserProfile() <-- Plug your actual user context endpoint profile loader here
    }, [])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setUpdating(true)
        try {
            // const response = await api.put("/user/profile", { name: profile.name })
            // setProfile(prev => ({ ...prev, name: response.data.name }))
            await new Promise(r => setTimeout(r, 800)) // Simulate network latency securely
            alert("Profile metadata updated successfully.")
        } catch (error) {
            console.error(error)
            alert("Failed to modify system identity parameters.")
        } finally {
            setUpdating(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match alignment criteria.")
            return
        }
        
        setLoading(true)
        try {
            // await api.post("/user/change-password", { currentPassword, newPassword })
            await new Promise(r => setTimeout(r, 1000))
            alert("Password parameters cycled successfully.")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error(error)
            alert("Authentication mutation rejected by firewall.")
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 transition-colors duration-300 relative overflow-x-hidden py-6">
            
            {/* Ambient Background Glow System */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                
                {/* Header Sub-Navigation Control */}
                <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <button
                        onClick={() => navigate(-1)} // Dynamically pops context stack cleanly back to previous dashboard state
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Workspace
                    </button>
                    
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase bg-gray-200/50 dark:bg-gray-800/50 px-2.5 py-1 rounded-md">
                        Identity Node
                    </span>
                </header>

                {/* Core Profile Focus Board */}
                <main className="space-y-6">
                    
                    {/* Identity Hero Glass Plate */}
                    <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-500/10">
                                {getInitials(profile.name)}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer">
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        <div className="text-center sm:text-left flex-1 space-y-1">
                            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {profile.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {profile.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    <Shield className="w-2.5 h-2.5" />
                                    {profile.role}
                                </span>
                                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                    Node Active Since {profile.joined}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Meta Management Block Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Box 1: Account Information Configuration */}
                        <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/60">
                                <User className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Profile</h3>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Display Username</label>
                                    <div className="flex items-center backdrop-blur-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide opacity-60">System Email (Locked)</label>
                                    <div className="flex items-center bg-gray-100/60 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none">
                                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-600 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            className="w-full bg-transparent outline-none text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        Save Information
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Box 2: Password Mutation Controls */}
                        <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/60">
                                <Key className="w-4 h-4 text-purple-500" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Change Password</h3>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-98 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                        Change
                                    </button>
                                </div>
                            </form>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Profile