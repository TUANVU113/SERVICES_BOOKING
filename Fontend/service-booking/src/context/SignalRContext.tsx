"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "@/context/AuthContext";
import { BookingItem } from "@/types/booking";
import { ToastContainer, ToastMessage } from "@/components/ui/ToastContainer";

interface SignalRContextType {
  isConnected: boolean;
  connectionState: signalR.HubConnectionState | "Disconnected";
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id" | "createdAt">) => void;
  removeToast: (id: string) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoggedIn } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState | "Disconnected">("Disconnected");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastMessage, "id" | "createdAt">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toastData,
      id,
      createdAt: new Date(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep maximum 5 toasts

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, [removeToast]);

  useEffect(() => {
    // Only connect if user is logged in with a valid token
    if (!isLoggedIn || !token) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      setIsConnected(false);
      setConnectionState("Disconnected");
      return;
    }

    const hubUrl = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "https://localhost:7118/hubs/booking";

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Do not retry if error is 401 Unauthorized (expired or invalid token)
          const errorMsg = retryContext.retryReason?.message || "";
          if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
            return null;
          }
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount < 3) return 2000;
          if (retryContext.previousRetryCount < 10) return 5000;
          return null;
        },
      })
      .configureLogging(signalR.LogLevel.None) // Prevent signalr internal errors from popping up in Next.js dev overlay
      .build();

    // 1. Event: BookingCreated
    connection.on("BookingCreated", (booking: BookingItem) => {
      console.log("🔔 [SignalR] BookingCreated event received:", booking);
      
      // Dispatch custom DOM event for active components
      window.dispatchEvent(new CustomEvent("booking:created", { detail: booking }));

      // Add Toast notification
      addToast({
        type: "booking_created",
        title: "🔔 Đơn đặt lịch mới",
        message: `Khách hàng ${booking.customerName} vừa đặt lịch ${booking.serviceName}`,
        booking,
      });
    });

    // 2. Event: BookingStatusChanged
    connection.on("BookingStatusChanged", (booking: BookingItem) => {
      console.log("🔔 [SignalR] BookingStatusChanged event received:", booking);

      // Dispatch custom DOM event for active components
      window.dispatchEvent(new CustomEvent("booking:statusChanged", { detail: booking }));

      const statusMap: Record<string, string> = {
        Pending: "Chờ xác nhận",
        Confirmed: "Đã xác nhận",
        Completed: "Hoàn thành",
        Cancelled: "Đã hủy",
      };

      const statusText = statusMap[booking.status] || booking.status;

      // Add Toast notification
      addToast({
        type: "status_changed",
        title: `🔄 Trạng thái đơn ${booking.bookingCode}`,
        message: `Đơn đã chuyển sang trạng thái: ${statusText}`,
        booking,
      });
    });

    // Reconnection handlers
    connection.onreconnecting((error) => {
      console.warn("⚠️ [SignalR] Connection lost, reconnecting...", error);
      setIsConnected(false);
      setConnectionState(signalR.HubConnectionState.Reconnecting);
    });

    connection.onreconnected((connectionId) => {
      console.log("✅ [SignalR] Reconnected successfully. ConnectionId:", connectionId);
      setIsConnected(true);
      setConnectionState(signalR.HubConnectionState.Connected);
    });

    connection.onclose((error) => {
      console.warn("❌ [SignalR] Connection closed.", error);
      setIsConnected(false);
      setConnectionState(signalR.HubConnectionState.Disconnected);
    });

    // Start connection with graceful 401 handling
    connection
      .start()
      .then(() => {
        console.log("🟢 [SignalR] Hub Connected successfully!");
        setIsConnected(true);
        setConnectionState(signalR.HubConnectionState.Connected);
      })
      .catch((err: unknown) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("401") || errMsg.includes("Unauthorized")) {
          console.warn("⚠️ [SignalR] 401 Unauthorized: Token hiện tại hết hạn hoặc không hợp lệ. Vui lòng Đăng xuất và Đăng nhập lại.");
        } else {
          console.warn("⚠️ [SignalR] Connection start failed:", errMsg);
        }
        setIsConnected(false);
        setConnectionState(signalR.HubConnectionState.Disconnected);
      });

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [token, isLoggedIn, addToast]);

  return (
    <SignalRContext.Provider
      value={{
        isConnected,
        connectionState,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};
