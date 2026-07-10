import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./AppContext";
import { realTimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppContext();
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketState(null);
      return;
    }

    if (socketRef.current) return;

    const socket = io(realTimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current = socket;
    setSocketState(socket);

    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log("connect_error", err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketState(null);
    };
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket: socketState }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
