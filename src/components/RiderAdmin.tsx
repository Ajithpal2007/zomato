import axios from "axios";
import toast from "react-hot-toast";
import { adminService } from "../main";

const RiderAdmin = ({rider, onVerify}: {rider: any, onVerify: () => void}) => {

   const verify = async ()=>{
    try {


      await axios.post(`${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization : `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      toast.success("Rider verified successfully");
      onVerify();
      
    } catch (error) {
      toast.error("Failed to verify rider");
      console.log(error);
      
    }
  }
 

  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
      <img src={rider.picture} alt="" className="h-40 w-full object-cover rounded" />

      <h3>{rider.phoneNumber}</h3>
      <p className="text-sm text-gray-500">{rider.aadharNumber}</p>
      <p> Driver License Number: {rider.driverLicenseNumber}</p>
      
      <button className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600" onClick={verify}>Verify Rider</button>
    </div>
  )
}

export default RiderAdmin