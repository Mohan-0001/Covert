import { createContext, useState } from 'react'
import run from '../utils/gemini'

export const dataContext = createContext()

const UserContext = ({ children, screenshotQueue, setScreenshotQueue }) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [messageHistory, setMessageHistory] = useState([])

  const newChat = () => {
    setShowResult(false)
    setLoading(false)
    setInput('')
    setMessageHistory([])
  }

  const sent = async (prompt, isProblem = false) => {
    if (!prompt.trim() && screenshotQueue.length === 0) return

    const userMessageText =
      screenshotQueue.length > 0
        ? `${prompt || ''}\n[Attached ${screenshotQueue.length} screenshot(s)]`
        : prompt

    setMessageHistory((prev) => [...prev, { sender: 'user', text: userMessageText }])
    setShowResult(true)
    setLoading(true)

    const imagesToSend = [...screenshotQueue] // copy for Gemini
    if (screenshotQueue.length > 0) {
      setScreenshotQueue([])
      window.electron.clearScreenshotQueue() // 👈 tell main to clear too
    }

    try {
      const response = await run({ text: prompt, images: imagesToSend }, isProblem)
      setMessageHistory((prev) => [...prev, { sender: 'bot', text: response }])
    } catch (error) {
      console.error('Error during AI interaction:', error)
      setMessageHistory((prev) => [
        ...prev,
        { sender: 'bot', text: 'An error occurred while getting a response.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <dataContext.Provider
      value={{
        input,
        setInput,
        sent,
        loading,
        showResult,
        messageHistory,
        setMessageHistory,
        newChat
      }}
    >
      {children}
    </dataContext.Provider>
  )
}

export default UserContext
