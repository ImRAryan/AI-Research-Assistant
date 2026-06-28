import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
})

const SKIP_REFRESH_PATHS = [
    "/users/change-password",
    "/auth/login",
]

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        const shouldSkip = SKIP_REFRESH_PATHS.some(path => original.url?.includes(path))

        if (error.response?.status === 401 && !original._retry && !shouldSkip) {
            original._retry = true

            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )
                const newToken = res.data.access_token
                localStorage.setItem("access_token", newToken)

                original.headers["Authorization"] = `Bearer ${newToken}`
                return api(original)

            } catch {
                localStorage.removeItem("access_token")
                window.location.href = "/"
            }
        }

        return Promise.reject(error)
    }
)

export default api