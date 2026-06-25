import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ShieldCheck, ArrowLeft } from "lucide-react"

function VerifyOTP() {
    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email || "your email"

    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)

    const handleVerify = async () => {
        if (!otp.trim()) {
            alert("Please enter the OTP")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                alert(data.detail || "Verification failed")
                return
            }

            alert("Email verified! You can now login.")
            navigate("/")

        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
            
            {/* Ambient Background Glow System */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Back to Authentication Flow Trigger */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer group z-20"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Login
            </button>

            {/* Glassmorphic Verification Card Canvas */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Branding / Security Feature Icon */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Verify Identity
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-relaxed max-w-[280px]">
                        We have dispatched a secure 6-digit cryptographic passcode to <span className="font-bold text-gray-800 dark:text-gray-200 break-all">{email}</span>
                    </p>
                </div>

                {/* Secure Verification Form Pipeline */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-2.5">
                            Secure Entry Token
                        </label>
                        <input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="w-full text-center text-3xl font-black tracking-[0.5em] pl-[0.5em] border border-gray-300/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Authenticating...
                            </>
                        ) : (
                            "Verify Secure Code"
                        )}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default VerifyOTP