import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Login() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            )

            const data = await response.json()

            console.log(data)

            if (!response.ok) {
                alert(data.detail)
                return
            }

            localStorage.setItem(
                "access_token",
                data.access_token
            )

            alert("Login successful!")

            navigate("/home")

        } catch (error) {

            console.error(error)

            alert(error.message)

        }

    }

    return (

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">

            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-[400px]">

                <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl mb-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl mb-4"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-black dark:bg-gray-600 text-white py-3 rounded-xl"
                >
                    Login
                </button>

                <button
                    onClick={() => {
                        window.location.href = "http://localhost:8000/auth/google"
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl mt-4 flex items-center justify-center gap-2"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
                    Login with Google
                </button>

                <p className="text-center mt-4 text-gray-700 dark:text-gray-300">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-blue-600 dark:text-blue-400 ml-1"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>

    )

}

export default Login