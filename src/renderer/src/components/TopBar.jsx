// // // import React from 'react'
// const TopBar = () =>{
//   const handleClose = () =>{
//     window.electron.send('close-window')
//   }

//   const handleMinimize = () =>{
//     window.electron.send('minimize-window')
//   }

//   return (
//     <div className="rounded-t-xl w-full h-8 flex items-center justify-betwee  select-none">
//       {/* Draggable region */}
//       <div className="flex-1 h-full" style={{ WebkitAppRegion: 'drag' }} />

//       {/* Control Buttons */}
//       <div className="flex gap-2 px-2" style={{ WebkitAppRegion: 'no-drag' }}>
//         <button
//           onClick={handleMinimize}
//           className="w-6 h-6 text-sm bg-yellow-400 rounded hover:bg-yellow-300"
//         >
//           _
//         </button>
//         <button
//           onClick={handleClose}
//           className="w-6 h-6 text-sm bg-red-500 rounded hover:bg-red-400"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TopBar;

// // The TopBar component, containing the "Ask AI" and "Show/Hide" buttons, and the Settings icon.
// // It is now a separate component as per your App.jsx file.

// // import React from 'react'
// import { useState } from 'react'
// import { LiaMicrophoneSolid } from 'react-icons/lia'
// import { IoSettingsOutline } from 'react-icons/io5'
// import Setting from './Setting'

// const TopBar = () => {
//   const [isMicOpen, setIsMicOpen] = useState(false)

//   return (
//     <div className="flex items-center py-[0.245rem] gap-[2rem] backdrop-blur-md bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 rounded-xl shadow-md text-gray-200 select-none">
//       {/* Left Side: Mic + Timer */}
//       <div className="flex items-center ml-[1rem] w-[5rem]  gap-2">
//         <button className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-white text-lg flex items-center gap-2 shadow-sm">
//           <span className="text-2xl" onClick={() => setIsMicOpen(!isMicOpen)}>
//             <LiaMicrophoneSolid />
//           </span>
//           {isMicOpen && <span className="text-xs font-mono">00:00</span>}
//         </button>
//       </div>

//       {/* Center Buttons */}
//       <div className="flex items-center gap-[3rem]">
//         <button className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-1.5xl rounded-md font-medium shadow-sm transition-all">
//           Ask AI <span className="text-gray-400">⌘↵</span>
//         </button>

//         <button className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-1.5xl rounded-md font-medium shadow-sm transition-all">
//           Show/Hide <span className="text-gray-400">⌘\</span>
//         </button>
//       </div>

//       {/* Right Side: Settings*/}
//       <div>
//         <button className="p-2 ml-[1rem] rounded-full bg-white/10 hover:bg-white/20 transition-colors">
//           <span className="text-2xl" onClick={() => <Setting />}>
//             <IoSettingsOutline />
//           </span>
//         </button>
//       </div>
//     </div>
//   )
// }

// export default TopBar



import { useState } from 'react';
import { LiaMicrophoneSolid } from 'react-icons/lia';
import { Settings, X } from 'lucide-react';
import Setting from './Setting';

const TopBar = ({ isSettingsOpen, setIsSettingsOpen }) => {
  const [isMicOpen, setIsMicOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className="relative w-full">
      {/* TopBar content */}
      <div className="flex items-center justify-between px-6 py-3 backdrop-blur-md bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 rounded-xl shadow-md text-gray-200 select-none z-10">
        {/* Mic + Timer */}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-white text-lg shadow-sm"
            onClick={() => setIsMicOpen(!isMicOpen)}
          >
            <span className="text-2xl">
              <LiaMicrophoneSolid />
            </span>
            {isMicOpen && <span className="text-sm font-mono">00:00</span>}
          </button>
        </div>

        {/* Center Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-full font-medium shadow-sm transition-all">
            Ask AI <span className="text-gray-400">⌘↵</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-full font-medium shadow-sm transition-all">
            Show/Hide <span className="text-gray-400">⌘+M</span>
          </button>
        </div>

        {/* Settings Button */}
        <div className="flex items-center justify-end">
          <button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={toggleSettings}
            aria-label="Toggle settings"
          >
            <span className="text-2xl">
              {isSettingsOpen ? <X size={24} /> : <Settings size={24} />}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Panel: FLOATING */}
      {isSettingsOpen && (
        <div className="absolute w-[97%] mt-2">
          <Setting />
        </div>
      )}
    </div>
  );
};

export default TopBar;



// // TopBar.jsx
// import { useState } from 'react'
// import { LiaMicrophoneSolid } from 'react-icons/lia'
// import { IoSettingsOutline } from 'react-icons/io5'
// import Setting from './Setting'

// const TopBar = () => {
//   const [isMicOpen, setIsMicOpen] = useState(false)
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false)

//   const toggleSettings = () => {
//     setIsSettingsOpen(!isSettingsOpen)
//   }

//   return (
//     <div className="relative">
//       {/* The main TopBar content */}
//       <div className="flex items-center py-[0.245rem] gap-[2rem] backdrop-blur-md bg-gradient-to-br from-[#1F1F1F]/70 to-[#2C2C2C]/60 border border-white/10 rounded-xl shadow-md text-gray-200 select-none">
//         {/* Left Side: Mic + Timer */}
//         <div className="flex items-center ml-[1rem] w-[5rem] gap-2">
//           <button className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-white text-lg flex items-center gap-2 shadow-sm">
//             <span className="text-2xl" onClick={() => setIsMicOpen(!isMicOpen)}>
//               <LiaMicrophoneSolid />
//             </span>
//             {isMicOpen && <span className="text-xs font-mono">00:00</span>}
//           </button>
//         </div>

//         {/* Center Buttons */}
//         <div className="flex items-center gap-[3rem]">
//           <button className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-1.5xl rounded-md font-medium shadow-sm transition-all">
//             Ask AI <span className="text-gray-400">⌘↵</span>
//           </button>

//           <button className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-1.5xl rounded-md font-medium shadow-sm transition-all">
//             Show/Hide <span className="text-gray-400">⌘\</span>
//           </button>
//         </div>

//         {/* Right Side: Settings*/}
//         <div>
//           <button
//             className="p-2 ml-[1rem] rounded-full bg-white/10 hover:bg-white/20 transition-colors"
//             onClick={toggleSettings}
//           >
//             <span className="text-2xl">
//               <IoSettingsOutline />
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* The Settings menu, conditionally rendered */}
//       {isSettingsOpen && (
//         <div className="absolute top-[110%] right-0 mt-2">
//           <Setting />
//         </div>
//       )}
//     </div>
//   )
// }

// export default TopBar
