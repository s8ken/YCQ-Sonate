"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Bot, User, Activity, MessageCircle } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { agentId } = params
  const messagesEndRef = useRef(null)

  const [agent, setAgent] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (agentId) {
      fetchAgent()
      createOrGetConversation()
    }
  }, [agentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setAgent(data.data)
      }
    } catch (error) {
      console.error("Error fetching agent:", error)
    }
  }

  const createOrGetConversation = async () => {
    try {
      // First, try to get existing conversation for this agent
      const conversationsResponse = await fetch("/api/conversations")
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        const existingConversation = conversationsData.conversations?.find((conv) => conv.agentId === agentId)

        if (existingConversation) {
          setConversation(existingConversation)
          setMessages(existingConversation.messages || [])
          return
        }
      }

      // Create new conversation if none exists
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Chat with ${agent?.name || "Agent"}`,
          agentId: agentId,
          type: "chat",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation)
        setMessages(data.conversation.messages || [])
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || isLoading) return

    const userMessage = {
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch(`/api/conversations/${conversation._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          agentId: agentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // The API returns both user and agent messages
        if (data.data && Array.isArray(data.data)) {
          // Remove the user message we added optimistically and add the server response
          setMessages((prev) => {
            const withoutOptimistic = prev.slice(0, -1)
            return [...withoutOptimistic, ...data.data]
          })
        }
      } else {
        // If API call fails, add error message
        const errorMessage = {
          content: "Sorry, I couldn't process your message. Please try again.",
          sender: "agent",
          timestamp: new Date(),
          isError: true,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        content: "Network error. Please check your connection and try again.",
        sender: "agent",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading agent...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-mono font-bold text-black">{agent.name}</h1>
                  <p className="text-sm text-gray-600">
                    {agent.provider} • {agent.model}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 font-mono text-xs">
                <Activity className="w-3 h-3 mr-1" />
                {isTyping ? "Typing..." : "Online"}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-mono text-gray-700">Trust Score</div>
                <div className="text-lg font-mono font-bold text-black">
                  {Math.round((agent.trustScore?.compliance || 0.9) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-mono font-semibold text-gray-800 mb-2">
                  Start a conversation with {agent.name}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  This agent is powered by {agent.provider} and configured with trust protocol integration. Ask anything
                  to begin your conversation.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-black text-white"
                          : message.isError
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className={`flex-1 max-w-3xl ${message.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-4 rounded-lg ${
                        message.sender === "user"
                          ? "bg-black text-white"
                          : message.isError
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-gray-50 border border-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 font-mono">
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.sender === "agent" && message.trustScore && (
                        <span className="ml-2">• Trust: {Math.round(message.trustScore * 100)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${agent.name}...`}
                  disabled={isLoading}
                  className="text-base py-3 px-4 border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="font-mono">
                {agent.provider} • {agent.model} • Trust Protocol Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
