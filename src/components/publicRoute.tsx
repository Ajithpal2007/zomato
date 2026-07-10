import { useAppContext } from "../context/AppContext"
import {Navigate, Outlet} from 'react-router-dom'
const PublicRoute= ()=> {
  const  {isAuth, loading} = useAppContext()

  if(loading) return null

  return isAuth ? <Navigate to="/"/>: <Outlet/>
}

export default PublicRoute

