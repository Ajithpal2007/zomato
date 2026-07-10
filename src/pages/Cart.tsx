import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { useState } from "react"
import type { ICart, IMenuItem, IRestaurant } from "../types"
import axios from "axios"
import { restaurantService } from "../main"
import toast from "react-hot-toast"
import { VscLoading } from "react-icons/vsc"
import { BiMinus, BiPlus } from "react-icons/bi"


const Cart = () => {
  const {cart,subtotal,quantity, fetchCart} = useAppContext()
  const navigate = useNavigate()

  const [loadingItemId, setLoadingItemId] = useState<string |null>(null)
  const [clearingCart, setClearingCart] = useState(false)

  if(!cart || cart.length === 0){
    return <div className="flex min-h-[60vh] justify-center items-center">
      <p className="text-gray-500 text-lg">Cart is empty</p>
    </div>
  }

  const restaurant = cart[0].restaurantId as IRestaurant

  const deliveryFee = subtotal < 250 ? 49 : 0;

  const platformFee = 7 ;

  const grandTotal = subtotal + deliveryFee + platformFee;

  const incrementQuantity = async(itemId: string)=>{
    try {

      setLoadingItemId(itemId)
      await axios.put(`${restaurantService}/api/cart/inc`,{
        itemId: itemId,
       
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      await fetchCart()
      
    } catch (error) {
      console.log(error)
      toast.error("Failed to increment quantity")
    }finally {
    setLoadingItemId(null)
  } 
  }

  const decrementQuantity = async(itemId: string)=>{
    try {

      setLoadingItemId(itemId)
      await axios.put(`${restaurantService}/api/cart/dec`,{
        itemId: itemId,
       
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      await fetchCart()
      
    } catch (error) {
      console.log(error)
      toast.error("Failed to decrement quantity")
    }finally {
    setLoadingItemId(null)
  } 
  }

  const clearCaert = async()=>{

    const confirm = window.confirm("Are you sure you want to clear the cart?")
    if(!confirm){
      return
    }
    try {

     setClearingCart(true)
      await axios.delete(`${restaurantService}/api/cart/clear`,
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      await fetchCart()
      
    } catch (error) {
      console.log(error)
      toast.error("Failed to clear cart")
    }finally {
    setClearingCart(false)
  } 
  };


  const checkout = () =>{
    navigate("/checkout")
  }

  return (
    <div className="mx-auto max-w-15xl px-4 py-6 space-y-6">
      <div className="rounded-xl bg-white p-4 shadow-sm ">
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">{restaurant.autoLocation.formattedAddress}</p>
      </div>

      <div className="space-y-6">
        {cart.map((cartItem: ICart)=>{
          const item = cartItem.itemId as IMenuItem
          const isLoading = loadingItemId === item._id

          return <div key={item._id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ">
            <img src={item.image} className="h-20 w-20 rounded object-cover"  alt="" />

            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">₹{item.price}</p>
            </div>
           
           <div className="flex items-center gap-3">
            <button className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50 " disabled={isLoading} onClick={()=>decrementQuantity(item._id)} >
              {isLoading ? (
                <VscLoading size={16} className="animate-spin"/>
              ) : (
                <BiMinus size={16} />
              ) }
            </button>

            <button>
              <span className="font-medium">{cartItem.quantity}</span>
            </button>

            <button className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50 " disabled={isLoading} onClick={()=>incrementQuantity(item._id)} >
              {isLoading ? (
                <VscLoading size={16} className="animate-spin"/>
              ) : (
                <BiPlus size={16} />
              ) }
            </button>


           </div>

           <p className="w-20 text-right font-medium">
             ₹{cartItem.quantity * item.price}
           </p>

          </div>

          
        })}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <div className="flex justify-center text-center">
          <span >Total Items</span>
          <span >{quantity}</span>
        </div>

        <div className="flex justify-between text-sm ">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-sm ">
          <span>Delivery Fee</span>
          <span >{deliveryFee === 0 ? "Free" : "₹" + deliveryFee}</span>
        </div>

        <div className="flex justify-between text-sm ">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {
          subtotal < 250 && (
            <p className="text-xs text-gray-500">
              Add Item worth ₹{250 - subtotal} more to get free delivery
            </p>
          )
        }

        

        <div className="flex justify-between text-base font-semibold border-t pt-2 ">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

        <button  className={`mt-3 w-full rounded-lg bg-[#E23744] py-3 text-sm font-semibold text-white hover:bg-red-800  ${
          !restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ""
        }`} disabled={!restaurant.isOpen} 
         onClick={checkout}>
          Proceed to Checkout
        </button>

        <button  className="mt-3 w-full rounded-lg bg-[#191818] py-3 text-sm font-semibold text-white hover:bg-gray-1000 flex justify-center items-center gap-3" onClick={clearCaert} disabled={clearingCart}>
          {clearingCart ? <VscLoading size={16} className="animate-spin"/> : "Clear Cart"}
        </button>
      </div>
      
    </div>
  )
}


export default   Cart
   