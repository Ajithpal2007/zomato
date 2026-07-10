import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/message.mp3"
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";

const ACTIVE_STATUS = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up"];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([])

  const [loading, setLoading] = useState(false)

  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const { socket } = useSocket()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(audio)
    audioRef.current.load()
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current!.pause()
        audioRef.current!.currentTime = 0
        setAudioUnlocked(true)
        console.log("audio unlocked")
      }).catch(() => {
        console.log("audio unlock failed")
      })

    }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/orders/restaurant/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      setOrders(data.orders || [])
    } catch (error) {
      console.log(error)

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchOrders()
  }, [restaurantId])

  useEffect(() => {
    if (!socket) return

    const onNewOrder = () => {
      console.log("new order")

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          console.log("audio play failed")

        })
      }


      fetchOrders()
    }

    socket.on("order:new", onNewOrder)

    return () => {
      socket.off("order:new", onNewOrder)
    }
  }, [socket, audioUnlocked])

  useEffect(() => {

    if(!socket) return

    const onUpdateOrder = () => {
      fetchOrders()
    }

    socket.on("order:rider_assigned", onUpdateOrder)

    return () => {
      socket.off("order:rider_assigned", onUpdateOrder)
    }
   
  }, [socket]);

  if (loading) {
    return <div className="text-gray-500">Loading Orders...</div>
  }

  const activeOrders = orders.filter((order) => ACTIVE_STATUS.includes(order.status))
  const completedOrders = orders.filter((order) => !ACTIVE_STATUS.includes(order.status))



  return (
    <div className="space-y-8">

      {!audioUnlocked && (
        <div className="bg-blue-50 border-blue-200 rounded-lg p-4 flex items-center justify-center">
          <div className="flex items-center">
            <span className="text-2xl">🔔</span>
            <div> <p className="font-medium text-blue-700">
              Enable audio to receive new order notifications.
            </p>
              <p className="text-sm text-blue-700">
                get notified when new orders are placed.
              </p>
            </div>
          </div>

          <button onClick={unlockAudio} className="bg-blue-500 text-white px-4 py-2 rounded-md">Enable Audio</button>
        </div>
      )}

      {
        <div className="space-y-3">

          <h3 className="text-lg font-semibold">Active Orders</h3>

          {activeOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No active orders.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
              ))}
            </div>
          )}


        </div>


      }

      <div className="space-y-3">

          <h3 className="text-lg font-semibold">Completed Orders</h3>

          {completedOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No completed orders.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
              ))}
            </div>
          )}


        </div>

    </div>
  )
}

export default RestaurantOrders
