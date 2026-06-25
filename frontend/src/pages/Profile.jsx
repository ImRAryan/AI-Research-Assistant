import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft } from "lucide-react"

function Profile() {

    const navigate = useNavigate()

    const [user, setUser] = useState(null)

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response = await api.get("/users/me")

                setUser(response.data)

            } catch (error) {

                console.log(error)
                navigate("/")

            }

        }

        fetchUser()

    }, [])

    const handleLogout = () => {

        localStorage.removeItem("access_token")
        navigate("/")

    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                Loading...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition-colors">

            <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 max-w-2xl mx-auto"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            <div className="bg-white dark:bg-gray-800 max-w-2xl mx-auto rounded-3xl shadow-lg p-10">

                <div className="flex flex-col items-center">

                    <img
                        src={
                            user.avatar_url ||
                            "https://via.placeholder.com/120"
                        }
                        alt="Profile"
                        className="w-28 h-28 rounded-full mb-5"
                    />

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user.name}
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {user.email}
                    </p>

                    <p className="mt-4 px-4 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full">
                        {user.provider}
                    </p>

                    <button
                        onClick={handleLogout}
                        className="mt-8 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    )

}

export default Profile