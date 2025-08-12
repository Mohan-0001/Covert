import { useState, useEffect } from 'react'

const Setting = () => {
  const [apiProvider, setApiProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isApiSettingShow, setIsApiSettingShow] = useState(false)

  useEffect(() => {
    // Load API Key
    window.electron.apiStorage.loadKey().then((storedKey) => {
      if (storedKey) setApiKey(storedKey)
    })

    // Load API Provider
    window.electron.apiStorage.loadProvider().then((storedProvider) => {
      if (storedProvider) setApiProvider(storedProvider)
    })
  }, [])

  const handleSave = () => {
    window.electron.apiStorage.saveKey(apiKey)
    window.electron.apiStorage.saveProvider(apiProvider)
    alert('API Key & Provider saved!')
    // Optionally reload state:
    // setApiProvider(apiProvider)
    // setApiKey(apiKey)
  }

  const shortcuts = [
    {
      action: 'Toggle Visibility',
      keys: 'Ctrl+Shift+M / Cmd+Shift+M',
      keysSymbols: 'Ctrl + ⇧ + M / ⌘ + ⇧ + M'
    },
    {
      action: 'Take Screenshot',
      keys: 'Ctrl+Shift+S / Cmd+Shift+S',
      keysSymbols: 'Ctrl + ⇧ + S / ⌘ + ⇧ + S'
    },
    {
      action: 'Process Screenshot',
      keys: 'Ctrl+Enter / Cmd+Enter',
      keysSymbols: 'Ctrl + Enter / ⌘ + Enter'
    },
    {
      action: 'Toggle Overlay',
      keys: 'Ctrl+Shift+Space / Cmd+Shift+Space',
      keysSymbols: 'Ctrl + ⇧ + Space / ⌘ + ⇧ + Space'
    },
    {
      action: 'Move Window',
      keys: 'Ctrl+Arrow Keys / Cmd+Arrow Keys',
      keysSymbols: 'Ctrl + Arrow Keys / ⌘ + Arrow Keys'
    },
    {
      action: 'Quit Application',
      keys: 'Ctrl+Shift+1 / Cmd+Shift+1',
      keysSymbols: 'Ctrl + ⇧ + 1 / ⌘ + ⇧ + 1'
    },
    {
      action: 'New Chat',
      keys: 'Ctrl+Shift+N / Cmd+Shift+N',
      keysSymbols: 'Ctrl + ⇧ + N / ⌘ + ⇧ + N'
    },
    {
      action: 'Focus Input',
      keys: 'Ctrl+Shift+F / Cmd+Shift+F',
      keysSymbols: 'Ctrl + ⇧ + F / ⌘ + ⇧ + F'
    }
  ]

  const renderHelpBox = () => {
    if (apiProvider === 'openai') {
      return (
        <>
          <p className="mb-2">Don’t have an OpenAI API key?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Create an account at{' '}
              <a
                href="https://platform.openai.com/signup"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline pointer-events-none cursor-not-allowed opacity-60"
              >
                OpenAI
              </a>
            </li>
            <li>
              Go to{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                API Keys
              </a>
            </li>
            <li>Paste the key here</li>
          </ol>
        </>
      )
    } else {
      return (
        <>
          <p className="mb-2">Don’t have a Gemini API key?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Sign in to
              <a
                href="https://makersuite.google.com/app"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google AI Studio
              </a>
            </li>

            <li>
              Navigate to
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                API Keys
              </a>
            </li>
            <li>Generate and paste your key here</li>
          </ol>
        </>
      )
    }
  }

  return (
    <div className="flex flex-col items-center ml-[0.245rem]">
      {/* API SETTINGS */}
      {!isApiSettingShow ? (
        <div
          className="w-full p-4 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 text-gray-200 font-mono text-sm cursor-pointer"
          onClick={() => setIsApiSettingShow(true)}
        >
          API Settings
        </div>
      ) : (
        <div className="w-full p-4 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 text-gray-200 font-mono text-sm">
          <h2 className="text-xl font-bold mb-2 border-b border-white/10 pb-2">API Settings</h2>
          <p className="text-gray-400 text-xs mb-4">
            Configure your API key and model preferences. You’ll need your own API key to use this
            application.
          </p>
          {/* Provider Toggle */}
          <div className="mb-4 flex items-center gap-3">
            {/* The OpenAI label is now disabled */}
            <label
              className={`flex items-center px-4 py-2 rounded-lg border text-sm cursor-not-allowed transition-all 
 bg-black/20 border-transparent text-gray-400`}
            >
              <input
                type="radio"
                checked={apiProvider === 'openai'}
                className="mr-2"
                disabled // This line disables the radio button
                readOnly
              />
              OpenAI <span className="ml-1 text-gray-400 text-xs">GPT-4o models</span>
            </label>
            {/* The Gemini label remains active */}
            <label
              className={`flex items-center px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                apiProvider === 'gemini'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-black/20 border-transparent text-gray-400'
              }`}
              onClick={() => setApiProvider('gemini')}
            >
              <input type="radio" checked={apiProvider === 'gemini'} className="mr-2" readOnly />
              Gemini <span className="ml-1 text-gray-400 text-xs">Gemini 1.5 models</span>
            </label>
          </div>
          {/* API Key Input */}
          <div className="mb-2">
            <label className="block mb-1 text-sm text-gray-300">API Key</label>

            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="mb-[1rem] w-full px-4 py-2 bg-black/40 border border-white/20 rounded-md text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />

            <button
              onClick={handleSave}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#3a3a3a] to-[#1e1e1e] text-white font-semibold text-sm rounded-lg shadow-lg transition-all duration-200 hover:from-[#4a4a4a] hover:to-[#2e2e2e] hover:shadow-xl active:scale-[0.98] active:shadow-md border border-white/10"
            >
              <span className="relative z-10">Save API Settings</span>
            </button>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current: {apiKey ? `sk-...${apiKey.slice(-4)}` : 'Not set'}</span>

              <button
                onClick={() => setShowKey(!showKey)}
                className="hover:underline text-blue-400"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {/* Dynamic Help Box */}
          <div className="bg-black/30 border border-white/10 rounded-lg p-3 mt-4 text-gray-400 text-xs">
            {renderHelpBox()}
          </div>
        </div>
      )}
      {/* SHORTCUTS */}
      <div className="w-full p-4 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 text-gray-200 font-mono text-sm mt-4">
        <div className="text-xl font-bold bg-transparent mb-4 border-b border-white/10 pb-2">
          Keyboard Shortcuts
        </div>

        <div className="flex flex-col gap-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-300">{shortcut.action}</span>
              <span className="text-gray-400 font-semibold">{shortcut.keys}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Setting
