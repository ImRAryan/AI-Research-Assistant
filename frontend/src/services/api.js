import axios from "axios"

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: true,
})

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

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true

            try {
                const res = await axios.post(
                    "http://127.0.0.1:8000/auth/refresh",
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