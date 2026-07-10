import { use, useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/message.mp3"
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";



interface IRider {
  _id: string;
  picture: string;
  phoneNumber: string;
  aaddharNumber: string;
  drivingLicenseNumber: string;
  isVerifired: boolean;
  isAvailble: boolean;

}


const RiderDashboard = () => {
  const { user } = useAppContext()
  const { socket } = useSocket()

  const [profile, setProfile] = useState<IRider | null>(null)
  const [loading, setLoading] = useState(false)

  const [toggling, setToggling] = useState(false)

  const [incomingOrders, setIncomingOrders] = useState<string[]>([])

  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null)

  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio)
    audioRef.current.preload = "auto"
  }, []);

  const unlockAudio = async() => {
    try {

      if(!audioRef.current) return
      await audioRef.current.play()
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setAudioUnlocked(true)
      console.log("audio unlocked")
           
    } catch (error) {
      toast.error("Failed to unlock audio")
      console.log(error)
      setAudioUnlocked(false)
    }
  };


  useEffect(()=>{
    if(!socket) return;

    const onOrderAvailable = ({orderId}: {orderId: string}) =>{
      setIncomingOrders((prev)=>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if(audioUnlocked && audioRef.current){
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          console.log("audio play failed")
        })
      }

      setTimeout(() => {
        setIncomingOrders((prev)=>
          prev.filter((id) => id !== orderId)
        )
      }, 10000)
    }

    socket.on("order:available", onOrderAvailable)

    return () => {
      socket.off("order:available", onOrderAvailable)
    }
  }, [socket, audioUnlocked])


  const fetchProfile = async () => {
    try {

      const { data } = await axios.get(`${riderService}/api/ridermyprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      setProfile(data || null)


    } catch (error) {
      setProfile(null)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user.role === "rider") {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user]);


  const fetchCurrentOrder = async () => {
    try {
       const {data} = await axios.get(`${riderService}/api/rider/order/current`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      setCurrentOrder(data.order)
    } catch (error) {
      setCurrentOrder(null)
      console.log(error)
    }
  };


  useEffect(() => {
    fetchCurrentOrder()
  }, []);

  const toggleAvailibility = async () => {
    if (!navigator.geolocation) {
      toast.error("Please enable location")
      return
    }



    setToggling(true)


    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post(`${riderService}/api/rider/toggle`, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          isAvailble: !profile?.isAvailble
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        toast.success(profile?.isAvailble ? "Availibility toggled to not avail" : "Availibility toggled to avail")
        fetchProfile()
      } catch (error) {
        toast.error("Failed to toggle availibility")
        console.log(error)
      } finally {
        setToggling(false)
      }

    }
    )

  };


  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addharNumber, setAddharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");


  const handelSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Please enable location")
      return
    }

    setSubmitting(true)

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aaddharNumber", addharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());
      if (image) {
        formData.append("picture", image)
      }

      try {
        const { data } = await axios.post(`${riderService}/api/rider/new`, {
          formData
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        toast.success("Profile updated")
        fetchProfile()
      } catch (error) {
        toast.error("Failed to update profile")
        console.log(error)
      } finally {
        setSubmitting(false)
      }

    })

  }


  if (user?.role !== "rider") {
    return <div className="flex justify-center items-center">Only riders can access this page</div>
  }

  if (loading) {
    return <div className="flex justify-center items-center">Loading...</div>
  }

  if (!profile) {
    return <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
        <h1 className="text-xl font-semibold">
          Add your Rider Profile
        </h1>

        <input type="number" placeholder="Aadhar Number" value={addharNumber} onChange={e => setAddharNumber(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none " />

        <input type="number" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none " />

        <input type="number" placeholder="Driving Licence" value={drivingLicenseNumber} onChange={e => setDrivingLicenseNumber(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm outline-none " />


        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">

          <BiUpload className="h-5 w-5 text-red-500 " />
          {image ? image.name : "Upload Rider Image"}
          <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files?.[0] || null)} />
        </label>


      </div>

      <button className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744]" disabled={submitting} onClick={handelSubmit} >
        {
          submitting ? "Adding Rider..." : "Add Rider"
        }
      </button>
    </div>


  }

  return (
    <div className="space-y-4">

      <div className="mx-auto max-w-md px-4 py-4">

        <div className="rounded-xl bg-white p-4 shadow space-y-3">
          <img src={profile?.picture} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />

          <p className="text-center font-semibold">{user?.name}</p>
          <p className="text-center text-gray-500">{profile.phoneNumber}</p>
          <div className="flex justify-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">{profile.isVerifired ? "verified" : "pending"}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">{profile.isAvailble ? "online" : "offline"}
            </span>
          </div>

          <div>
            <p className="text-blue-400">
              Please be within a 500 m radius of any restaurant (which we call a hotspot) before going online as a rider to receive orders.
            </p>
          </div>
          {
            profile.isVerifired   && <button disabled={toggling} onClick={toggleAvailibility}
              className={`w-full py-2 text-white font-semibold ${toggling
                ? "bg-gray-400"
                : profile.isAvailble
                  ? "bg-gray-600"
                  : "bg-green-6000"
                }`}
            >
              {
                toggling ? "Toggling..." : profile.isAvailble ? "Go offline" : "Go online"
              }
            </button>
          }
        </div>
      </div>


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



      {profile.isAvailble && incomingOrders.length > 0 && (
        <div className="mx-auto max-w-mid px-4 space-y-3">
          <h3 className="font-semibold text-gray-700">Incoming Orders</h3>
          {incomingOrders.map((id) => (
            <RiderOrderRequest key={id} orderId={id} onAccepted={()=>{
              fetchProfile();
              fetchCurrentOrder()
            }} />
          ))}
        </div>
      )}

      { currentOrder && ( 
        <div className="mx-auto max-w-md px-4 space-y-4">
          <RiderCurrentOrder order={currentOrder} onStatusUpdate={()=>{
            fetchCurrentOrder()
          }} />

          <RiderOrderMap order={currentOrder} />

      </div> )}

    </div>
  )
}

export default RiderDashboard
