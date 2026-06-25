import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get("access_token")
        console.log("token from URL:", token)

        if (token) {
            localStorage.setItem("access_token", token)
            navigate("/home")
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-lg">Signing you in...</p>
        </div>
    )
}

export default AuthCallback