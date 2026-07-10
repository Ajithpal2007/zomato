import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { authService } from "../main"
import { toast } from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google";
import {FcGoogle  } from "react-icons/fc";
import { useAppContext } from "../context/AppContext"


const Login = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {setUser, setIsAuth} = useAppContext()

    const responseGoogle = async(authResult:any)=>{
      setLoading(true)
      try {
        const result = await axios.post(`${authService}/api/auth/login`,{
          code: authResult["code"]
        })

        localStorage.setItem("token", result.data.token)
        toast.success(result.data.message)
        setLoading(false)
        setUser(result.data.user)
        setIsAuth(true)
        navigate("/")
      } catch (error) {
        console.log(error)
        toast.error("Login failed")
        setLoading(false)
      }
    }

    const googleLogin = useGoogleLogin({
      onSuccess: responseGoogle,
      onError: responseGoogle,
      flow: "auth-code"
    })

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
      <h1 className="text-center text-3xl font-bold text-[#E23774]">
        Zomato
        </h1>
        <p className="text-center text-sm text-gray-500">
          Login or sign up to continue to Zomato
        </p>
        <button onClick={googleLogin} disabled={loading}  className="flex w-full items-center justify-center rounded-xl border-gray-300 bg-white px-4 py-3 ">
          <FcGoogle size={20} />
          {
            loading ? "Loading..." : "Continue with Google"
          }
        </button>

        <p className="text-center text-xs text-gray-400">
         By continuing, you agree to Zomato's <span className="text-[#E23774]">Terms of Service</span> and <span className="text-[#E23774]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

export default Login