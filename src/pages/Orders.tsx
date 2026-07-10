import { useEffect, useState } from "react"
import type { IOrder } from "../types"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { restaurantService } from "../main"
import { useSocket } from "../context/SocketContext"


const ACTIVE_STATUS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up"
]
const Orders = () => {

  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { socket } = useSocket()

  const fetchOrders = async () => {
    try {
      const {data} = await axios.get(`${restaurantService}/api/order/myorder`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
      setOrders(data.orders || [])
      
    } catch (error) {
      console.log(error)
    }finally{
      setLoading(false)
    }
  }


  useEffect(()=>{
    fetchOrders()
  },[])


  useEffect(()=>{
    if(!socket) return

    const onOrderUpdate = ()=>{
      fetchOrders()
    }

    socket.on("order:update", onOrderUpdate)
    socket.on("order:rider_assigned", onOrderUpdate)
    return ()=>{
      socket.off("order:update", onOrderUpdate)
      socket.off("order:rider_assigned", onOrderUpdate)
    }
    

  },[socket]);

 

  if(loading) {
    return <p className="text-center text-gray-500">Loading...</p>
  }

  if(orders.length === 0) {
    return <p className="text-center text-gray-500">No orders found.</p>
  }

  const activeOrders = orders.filter((order) => ACTIVE_STATUS.includes(order.status))
  const completedOrders = orders.filter((order) => !ACTIVE_STATUS.includes(order.status))


  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6" >
      <div className="text-2xl font-bold">My Orders</div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Active Orders</h2>
        {
          activeOrders.length === 0? (
            <p>No active orders found.</p>
          ):(
            activeOrders.map((order)=>{
              return <OrderRow 
              key={order._id}
              order={order}
              onClick={() => navigate(`/order/${order._id}`)}
              />
            })
          )
        }
        </section>    

        <section className="space-y-3">
        <h2 className="text-2xl font-bold">Completed Orders</h2>
        {
          completedOrders.length === 0? (
            <p>No completed orders found.</p>
          ):(
            completedOrders.map((order)=>{
              return <OrderRow 
              key={order._id}
              order={order}
              onClick={() => navigate(`/order/${order._id}`)}
              />
            })
          )
        }
        </section>  

    </div>
  )
}

export default Orders


// OrderRow

const OrderRow = ({order, onClick}: {order: IOrder, onClick: () => void}) => {
  return (
    <div className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50 " onClick={onClick}>
    <div className="flex justify-between items-center">
      <p className="text-lg font-bold">Order {order._id}</p>
      <p className="text-sm text-gray-500">{order.status}</p>
    </div>
    <div className="mt-2 text-sm text-gray-600" >
      {order.items.map((item,i)=>(
        <span key={i}>
          {item.name} x {item.quantity}
          {i < order.items.length -1 && ", "}
        </span>
      ))}
    </div>

    <div className="mt-2 flex justify-between text-sm font-medium">
      <span>Total</span>
   <span>₹{order.totalAmount}</span>
    </div>


    </div>
  )
};


