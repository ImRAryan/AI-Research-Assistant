import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function VerifyOTP() {

    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email || ""

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

        <div className="min-h-screen bg-gray-100 flex items-center justify-center">

            <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">

                <h1 className="text-3xl font-bold text-center mb-2">
                    Verify Email
                </h1>

                <p className="text-gray-500 text-center mb-6">
                    Enter the 6-digit OTP sent to <b>{email}</b>
                </p>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full border p-3 rounded-xl mb-4 text-center text-2xl tracking-widest"
                />

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify"}
                </button>

            </div>

        </div>

    )

}

export default VerifyOTP