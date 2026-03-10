'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io('http://localhost:8002')
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected:', socket.id)
    })

    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = () => {
    socketRef.current?.emit('chat message', 'Hello!')
  }

  return (
    <div>
      {messages.map((msg, i) => <p key={i}>{msg}</p>)}
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}