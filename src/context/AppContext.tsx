import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, restaurantService } from "../main";
import axios from "axios";
import type { AppContextValue, ICart, User, LocationData } from "../types";
import { Toaster } from "react-hot-toast";



const AppContext = createContext<AppContextValue | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [city, setCity] = useState("Fecthing Location...")
  

   async function fetchUser() {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setUser(data.user)
      setIsAuth(true)
    } catch (error) {
      console.log(error)
      setIsAuth(false)
    } finally {
      setLoading(false)
    }
  }

  const [cart, setCart] = useState<ICart[]>([])

    const [subtotal, setSubtotal] = useState(0)
    const [quantity, setQuantity] = useState(0)

async function fetchCart() {
  if(!user || user.role !== "customer") return
  try {
    const {data} = await axios.get(`${restaurantService}/api/cart/all`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    setCart(data.cart ?? [])
    setSubtotal(data.subTotal ?? 0)
    setQuantity(data.cartLength ?? 0)
  } catch (error) {
    console.log(error)
    
  }  
}

   useEffect(()=>{
    fetchUser()
   },[])


   useEffect(()=>{
  if(user && user.role === "customer"){
    fetchCart()
  }
},[user])


useEffect(()=>{
  if(!navigator.geolocation) return alert("please allow location to continue") ;
  setLoadingLocation(true);

  navigator.geolocation.getCurrentPosition(async (position)=>{
    const {latitude, longitude} = position.coords;

    try {
      const res = await fetch(
        `${authService}/api/auth/location?lat=${latitude}&lon=${longitude}`
      );

      const data = await res.json();

      setLocation({
        latitude,
        longitude,
        formattedAddress: data.display_name || "current location",
      });

      setCity(data.address?.city || data.address?.town || data.address?.village || "your location")
      
      
    } catch (error) {

      setLocation({
        latitude,
        longitude,
        formattedAddress: "current location",
      })
      console.log(error)

      setCity("Failed to load")

      
    } finally {
      setLoadingLocation(false)
    }
  }, (error) => {
    console.log("Geolocation error:", error);
    setLoadingLocation(false);
    setCity("Location denied");
  })
},[])

return (
  <>
    <AppContext.Provider value={{ isAuth, loading, setIsAuth, setLoading, user, setUser, location, loadingLocation, city, cart, fetchCart, subtotal, quantity }}>
      {children}
    </AppContext.Provider>
    <Toaster />
  </>
)


}


export const useAppContext = (): AppContextValue=>{
  const context = useContext(AppContext)
  if(!context){
    throw new Error("useAppContext must be used within a AppProvider")
  }
   return context
}