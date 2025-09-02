"use client"

import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, AlertCircle } from "lucide-react"

export function LiveTrustFeed({ userId }: { userId?: string }) {
  const { isConnected, trustUpdates, systemHealth } = useRealTimeUpdates(userId)

  return (
    <Card className="h-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Trust Feed</CardTitle>
        <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {trustUpdates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Shield className="mx-auto h-8 w-8 mb-2" />
            <p>No trust updates yet</p>
          </div>
        ) : (
          trustUpdates.map((update, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                {update.type === "declaration" && <Shield className="h-4 w-4 text-green-500" />}
                {update.type === "violation" && <AlertCircle className="h-4 w-4 text-red-500" />}
                {update.type === "validation" && <Clock className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{update.title}</p>
                <p className="text-xs text-muted-foreground">{update.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
