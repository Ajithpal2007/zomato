import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}


const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {

  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(()=>{
    const interval = setInterval(()=>{
      setSecondsLeft((prev)=>{
        if( prev <= 1 ) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      })
    }, 1000)
    return ()=>{
      clearInterval(interval);
    }
  }, [onAccepted])


  const acceptOrder = async ()=>{

    try {

      await axios.post(`${riderService}/api/rider/accept/${orderId}`,{},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      )

      toast.success("Order Accepted");
      onAccepted();
      
    } catch (error) {
      console.error("Order Acceptance Failed", error);
      toast.error("Error accepting order");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-300 space-y-3">
      <p className="text-center text-xs font-semibold text-red-600">
        Accept Order in: {secondsLeft} seconds
        
      </p>
      
      <p className="text-center text-xs font-semibold text-green-600">
        New Delivery Request
      </p>

      <p className="text-center text-xs font-semibold text-gray-600">
        Order ID: {orderId.slice(-6)}
      </p>

      <button className="w-full h-12 bg-green-600 text-white font-semibold rounded-xl" onClick={acceptOrder} disabled={accepting}>
        {accepting ? "Accepting..." : "Accept Order"}
      </button>

      
    </div>
  )
}

export default RiderOrderRequest
