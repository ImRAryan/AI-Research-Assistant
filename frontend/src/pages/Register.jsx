import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Register() {

    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async () => {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                alert("Registration failed")
                return
            }

            navigate("/verify-otp", { state: { email } })

        } catch (error) {

            console.error(error)
            alert("Registration failed")

        }

    }

    return (

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">

            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-[400px]">

                <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    Register
                </h1>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl mb-4"
                />

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
                    onClick={handleRegister}
                    className="w-full bg-black dark:bg-gray-600 text-white py-3 rounded-xl"
                >
                    Register
                </button>

                <p className="text-center mt-4 text-gray-700 dark:text-gray-300">

                    Already have an account?

                    <Link
                        to="/"
                        className="text-blue-600 dark:text-blue-400 ml-1"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>

    )

}

export default Register