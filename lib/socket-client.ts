import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(userId?: string) {
    if (this.socket?.connected) return this.socket

    const socketUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
        : "http://localhost:5000"

    this.socket = io(socketUrl, {
      auth: { userId },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("[v0] Socket connected:", this.socket?.id)
    })

    this.socket.on("trust_declaration_update", (data) => {
      this.emit("trust_declaration_update", data)
    })

    this.socket.on("agent_status_change", (data) => {
      this.emit("agent_status_change", data)
    })

    this.socket.on("context_bridge_created", (data) => {
      this.emit("context_bridge_created", data)
    })

    this.socket.on("system_health_update", (data) => {
      this.emit("system_health_update", data)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || []
    eventListeners.forEach((listener) => listener(data))
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event) || []
    const index = eventListeners.indexOf(callback)
    if (index > -1) {
      eventListeners.splice(index, 1)
    }
  }

  joinTrustSession(sessionId: string) {
    this.socket?.emit("join_trust_session", { sessionId })
  }

  leaveTrustSession(sessionId: string) {
    this.socket?.emit("leave_trust_session", { sessionId })
  }

  broadcastTrustUpdate(sessionId: string, update: any) {
    this.socket?.emit("trust_update", { sessionId, update })
  }
}

export const socketManager = new SocketManager()
