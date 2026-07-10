import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';



import 'leaflet/dist/leaflet.css'

export const authService = "https://zomato-auth-p5c2.onrender.com"
export const restaurantService = "https://restaurant-service-4f06.onrender.com"
export const utilitsService = "https://utils-2eat.onrender.com"
export const realTimeService = "https://realtime-vw2t.onrender.com"
export const riderService = "https://rider-txzj.onrender.com"
export const adminService = "https://admin-en39.onrender.com"



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="94788859372-40cv2pjcr727mkvv1ml05ba7cm8rv5pa.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
