"use client"

import { useEffect, useState } from "react"
import { socketManager } from "@/lib/socket-client"

export function useRealTimeUpdates(userId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [trustUpdates, setTrustUpdates] = useState<any[]>([])
  const [agentUpdates, setAgentUpdates] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)

  useEffect(() => {
    const socket = socketManager.connect(userId)

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    const handleTrustUpdate = (data: any) => {
      setTrustUpdates((prev) => [data, ...prev.slice(0, 49)]) // Keep last 50 updates
    }

    const handleAgentUpdate = (data: any) => {
      setAgentUpdates((prev) => [data, ...prev.slice(0, 49)])
    }

    const handleSystemHealth = (data: any) => {
      setSystemHealth(data)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socketManager.on("trust_declaration_update", handleTrustUpdate)
    socketManager.on("agent_status_change", handleAgentUpdate)
    socketManager.on("system_health_update", handleSystemHealth)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socketManager.off("trust_declaration_update", handleTrustUpdate)
      socketManager.off("agent_status_change", handleAgentUpdate)
      socketManager.off("system_health_update", handleSystemHealth)
    }
  }, [userId])

  return {
    isConnected,
    trustUpdates,
    agentUpdates,
    systemHealth,
    joinTrustSession: socketManager.joinTrustSession.bind(socketManager),
    leaveTrustSession: socketManager.leaveTrustSession.bind(socketManager),
    broadcastTrustUpdate: socketManager.broadcastTrustUpdate.bind(socketManager),
  }
}
