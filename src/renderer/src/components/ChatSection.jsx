import { useContext, useRef, useEffect, useState } from 'react'
import { LuSendHorizontal } from 'react-icons/lu'
import { dataContext } from '../context/UserContext'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// ----------------------
// Markdown Renderer
// ----------------------
const MarkdownContent = ({ text }) => {
  return (
    <div className="prose prose-invert max-w-none break-words">
      <ReactMarkdown
        children={text}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      />
    </div>
  )
}

// ----------------------
// Dull / Whitened Styles
// ----------------------
const dullOpacityMap = [1, 0.8, 0.6, 0.4, 0.2, 0]
const dullBrightnessMap = [1, 0.9, 0.8, 0.7, 0.6, 0.5]
const whitenedOpacityMap = [1, 1, 1, 1, 1, 1]
const whitenedBrightnessMap = [1, 1.1, 1.2, 1.3, 1.4, 1.5]

const computeStyles = (dullLevel, whitenedLevel) => {
  let opacity = 1
  let brightness = 1

  if (dullLevel > 0) {
    opacity = dullOpacityMap[dullLevel]
    brightness = dullBrightnessMap[dullLevel]
  }

  if (whitenedLevel > 0) {
    opacity = whitenedOpacityMap[whitenedLevel]
    brightness = whitenedBrightnessMap[whitenedLevel]
  }

  return { opacity, brightness }
}

// ----------------------
// Messages
// ----------------------
const UserMessage = ({ text, dullLevel = 0, whitenedLevel = 0 }) => {
  const { opacity, brightness } = computeStyles(dullLevel, whitenedLevel)
  return (
    <div className="flex items-start gap-3">
      <img
        src="/user.svg"
        alt="User"
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <p
        className="bg-white/10 text-white rounded-xl p-3 max-w-[97%] break-words"
        style={{ opacity, filter: `brightness(${brightness})` }}
      >
        {text}
      </p>
    </div>
  )
}

const BotMessage = ({ text, isLoading, dullLevel = 0, whitenedLevel = 0 }) => {
  const { opacity, brightness } = computeStyles(dullLevel, whitenedLevel)

  return (
    <div className="flex items-start gap-3">
      <img
        src="/bot.jpg"
        alt="Bot"
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      {isLoading ? (
        <div className="loader flex flex-col gap-1 w-20">
          <hr className="w-full h-2 bg-gray-500 rounded-full animate-pulse" />
          <hr className="w-full h-2 bg-gray-500 rounded-full animate-pulse" />
          <hr className="w-full h-2 bg-gray-500 rounded-full animate-pulse" />
        </div>
      ) : (
        <div
          className="bg-zinc-800/30 text-white rounded-xl p-3 max-w-[97%] break-words"
          style={{ opacity, filter: `brightness(${brightness})` }}
        >
          <MarkdownContent text={text} />
        </div>
      )}
    </div>
  )
}

// ----------------------
// Chat Section
// ----------------------
const ChatSection = ({ isOverlay }) => {
  const { sent, input, setInput, loading, messageHistory = [], setMessageHistory } =
    useContext(dataContext)

  const [isProblemMode, setIsProblemMode] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const MAX_LEVEL = 5
  const [dullLevel, setDullLevel] = useState(0)
  const [whitenedLevel, setWhitenedLevel] = useState(0)

  // Ctrl+D / Ctrl+L for dull/whitened effects
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault()
          setDullLevel((level) => (level >= MAX_LEVEL ? 0 : level + 1))
          setWhitenedLevel(0)
        } else if (e.key.toLowerCase() === 'l') {
          e.preventDefault()
          setWhitenedLevel((level) => (level >= MAX_LEVEL ? 0 : level + 1))
          setDullLevel(0)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Ctrl+N clears chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setMessageHistory([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setMessageHistory])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageHistory])

  // Focus input from external trigger
  useEffect(() => {
    window.electron?.onInputFocus(() => {
      inputRef.current?.focus()
    })
  }, [])

  const handleSend = () => {
    if (input.trim()) {
      sent(input, isProblemMode)
      setInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Messages */}
      <div className="flex-grow overflow-y-scroll scrollbar-hide overflow-y-auto p-6 space-y-6">
        {messageHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Your AI Assistant
            </h1>
            <span className="text-xl text-gray-400 mt-2">
              How can I help you today?
            </span>
          </div>
        ) : (
          messageHistory.map((message, index) => {
            if (message.sender === 'user') {
              return (
                <UserMessage
                  key={index}
                  text={message.text}
                  dullLevel={dullLevel}
                  whitenedLevel={whitenedLevel}
                />
              )
            }
            if (message.sender === 'bot') {
              return (
                <BotMessage
                  key={index}
                  text={message.text}
                  isLoading={loading && index === messageHistory.length - 1}
                  dullLevel={dullLevel}
                  whitenedLevel={whitenedLevel}
                />
              )
            }
            return null
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center p-4 gap-3 border-t border-white/10 bg-white/5">
        <textarea
          rows="1"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything..."
          className="flex-grow bg-white/10 text-white border-none rounded-full px-4 py-3 resize-none focus:outline-none placeholder-gray-400"
        />

        <button
          onClick={() => setIsProblemMode((prev) => !prev)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            isProblemMode
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          {isProblemMode ? 'Problem Mode' : 'Normal Mode'}
        </button>

        {input && (
          <button
            onClick={handleSend}
            className="p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
          >
            <LuSendHorizontal size={24} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatSection
