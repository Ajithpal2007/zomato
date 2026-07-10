import axios from "axios"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { utilitsService } from "../main"
import toast from "react-hot-toast"



const OrderSuccess = () => {
  const [params] = useSearchParams()
  const sessionId = params.get("session_id")

  useEffect(()=>{
    const verifyPayment = async () => {
      if(!sessionId) return

      try {
        await axios.post(`${utilitsService}/api/payment/stripe/verify`,{
          sessionId
        })

        toast.success("Payment verified")
        
      } catch (error) {
        toast.error("Failed to verify payment");
        console.log(error)
      }
    }
    verifyPayment()
  },[sessionId])
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Payment Successfull</h1>
    </div>
  )
}

export default OrderSuccess
