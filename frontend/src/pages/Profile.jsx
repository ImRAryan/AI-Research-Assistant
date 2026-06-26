import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, User, Mail, Shield, Save, Loader2, Key } from "lucide-react"
import api from "../services/api"

function Profile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [fetching, setFetching] = useState(true)

    const [profile, setProfile] = useState(null)
    const [name, setName] = useState("")

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get("/users/me")
            setProfile(res.data)
            setName(res.data.name)
        } catch (error) {
            console.error(error)
            navigate("/")
        } finally {
            setFetching(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            alert("Name cannot be empty")
            return
        }

        setUpdating(true)
        try {
            const res = await api.put("/users/me", { name: name.trim() })
            setProfile(res.data)
            alert("Profile updated successfully")
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.detail || "Failed to update profile"
            alert(msg)
        } finally {
            setUpdating(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match")
            return
        }

        setLoading(true)
        try {
            await api.post("/users/change-password", {
                current_password: currentPassword,
                new_password: newPassword,
            })
            alert("Password changed successfully")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.detail || "Failed to change password"
            alert(msg)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    }

    const isGoogleAccount = profile?.provider === "google"

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 transition-colors duration-300 relative overflow-x-hidden py-6">

            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">

                <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>

                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase bg-gray-200/50 dark:bg-gray-800/50 px-2.5 py-1 rounded-md">
                        Account
                    </span>
                </header>

                <main className="space-y-6">

                    <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="avatar"
                                    className="h-20 w-20 rounded-2xl object-cover shadow-md"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-500/10">
                                    {getInitials(profile?.name)}
                                </div>
                            )}
                        </div>

                        <div className="text-center sm:text-left flex-1 space-y-1">
                            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {profile?.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {profile?.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    <Shield className="w-2.5 h-2.5" />
                                    {profile?.provider === "google" ? "Google Account" : "Local Account"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-6">

                        {/* Display Name */}
                        <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/60">
                                <User className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Profile</h3>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Display Name</label>
                                    <div className="flex items-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide opacity-60">Email (cannot be changed)</label>
                                    <div className="flex items-center bg-gray-100/60 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 cursor-not-allowed select-none">
                                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-600 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            value={profile?.email || ""}
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
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Password — only for local accounts */}
                        {!isGoogleAccount && (
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
                                                minLength={8}
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
                                                minLength={8}
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
                                            Change Password
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        {isGoogleAccount && (
                            <section className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 shadow-sm">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    🔒 You signed in with Google, so your password is managed by Google. There's nothing to change here.
                                </p>
                            </section>
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Profile