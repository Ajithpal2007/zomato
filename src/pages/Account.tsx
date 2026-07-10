import toast from "react-hot-toast"
import { useAppContext } from "../context/AppContext"
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi"
import { useNavigate } from "react-router-dom"


const Account = () => {
  const {user, setUser, setIsAuth, loading} = useAppContext()

  const firstLetter = user?.name?.[0]?.toUpperCase() || '?'

  const navigate = useNavigate()

  const logoutHandler = () => {
    localStorage.setItem("token", "")
    setUser(null)
    setIsAuth(false)
    navigate("/login")
    toast.success("Logout successful")
    
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  
  if (!user) return <div className="min-h-screen flex items-center justify-center">No user data</div>

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 ">
      <div className="mx-auto max-w-md rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center p-5">
          <div className="flex h-14 w-14 items-center ju  rounded-full bg-red-500 text-xl font-semibold text-white">
            {firstLetter}
          </div>
          <div>
          <h1 className="text-lg font-semibold ">{
          user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="divide-y">
          <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={()=>navigate("/orders")}>
            <BiPackage className="h-5 w-5 text-red-500" />
            <span className="font-medium">your orders</span>
          </div>

           <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={()=>navigate("/address")}>
            <BiMapPin className="h-5 w-5 text-red-500" />
            <span className="font-medium">your address</span>
          </div>

           <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={()=>logoutHandler()}>
            <BiLogOut className="h-5 w-5 text-red-500" />
            <span className="font-medium">logout</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Account