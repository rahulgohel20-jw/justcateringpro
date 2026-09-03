import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, X, Youtube, HardDrive, ArrowBigLeft, ArrowLeft, VideoIcon } from "lucide-react";
import { useState } from "react";


const TUTORIALS = [
  {
    id: 1,
    title: "How to create event?",
    type: "youtube",
    youtubeId: "J6HiVxdJLWM", 
  },
  {
    id: 2,
    title: "How to do menu planning?",
    type: "youtube",
    youtubeId: "LUFrIjDmaD0",
  },
  
  {
    id: 3,
    title: "How to make quotation?",
    type: "youtube",
    youtubeId: "TmDYeP6l2J0",
  },
  {
    id: 4,
    title: "How to do menu / agency execution?",
    type: "youtube",
    videoSrc: "/videos/quotation.mp4",
    youtubeId: "du8bu9QXPGc",
    
  },
  {
    id: 5,
    title: "How raw material distribution works?",
    type: "youtube",
    videoSrc: "/videos/quotation.mp4",
    youtubeId: "uNNNda5-Aio",
    
  },
];

// ── Video Player ──────────────────────────────────────────────────────────────
const VideoPlayer = ({ tutorial, onBack , onSelect  }) => {
  if (!tutorial) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-6 my-4 overflow-y-auto no-scrollbar">
        <div className=" p-5 rounded-full bg-blue-100 flex items-center justify-center text-4xl mb-4">
          <VideoIcon size={24} />
        </div>
        <h1 className="text-3xl font-semibold text-black">Welcome!</h1>
        <p className="text-[#646464] text-lg mt-1">Select a tutorial to get started.</p>

        <div className="grid grid-cols-2 gap-6 mt-8 w-full max-w-xl">
          {TUTORIALS.filter((t) => t.type).map((t) => (
            <div
              key={t.id}
              className="p-6 border rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <button onClick={() => onSelect(t)}>
                  <Play className="w-6 h-6 text-primary" />
                </button>
              </div>
              <p className="text-gray-700 font-medium text-center text-sm">{t.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video title bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
  
  <button
    onClick={onBack}
    className="flex gap-1 text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
  >
    <ArrowLeft size={16} /> Back
  </button>

  {tutorial?.type === "youtube" ? (
    <Youtube className="w-5 h-5 text-red-500" />
  ) : (
    <HardDrive className="w-5 h-5 text-blue-500" />
  )}

  <h2 className="text-base font-semibold text-gray-800">
    {tutorial?.title}
  </h2>
</div>

      {/* Player area */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {tutorial.type === "youtube" ? (
          <iframe
            key={tutorial.youtubeId}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${tutorial.youtubeId}?autoplay=1&rel=0`}
            title={tutorial.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            key={tutorial.videoSrc}
            className="w-full h-full max-h-[500px]"
            src={tutorial.videoSrc}
            controls
            autoPlay
            controlsList="nodownload"
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function SidebarModal({ open, onClose }) {
  const [activeTutorial, setActiveTutorial] = useState(null);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto absolute top-6 bottom-6 right-12 w-[1300px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="relative flex w-full">

                {/* ── Sidebar ── */}
                <div className="w-[300px] bg-[#F7F9FC] border-r px-6 py-8 overflow-y-auto no-scrollbar flex-shrink-0">
                  <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-primary">
                    Just Catering X Tutorial
                   
                  </h2>

                  <div className="space-y-3">
                    {TUTORIALS.map((item) =>
                      item.children ? (
                        <Accordion key={item.id} title={item.title}>
                          <div className="mt-3 ml-2 space-y-2">
                            {item.children.map((child, idx) => (
                              <SubItem
                                key={child.id}
                                index={idx + 1}
                                title={child.title}
                                type={child.type}
                                active={activeTutorial?.id === child.id}
                                onClick={() => setActiveTutorial(child)}
                              />
                            ))}
                          </div>
                        </Accordion>
                      ) : (
                        <button
                          key={item.id}
                          onClick={() => setActiveTutorial(item)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between transition
                            ${activeTutorial?.id === item.id
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                          {item.title}
                          <Play className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        </button>
                      )
                    )}
                  </div>

                  <button className="absolute bottom-6 left-6 text-gray-500 text-sm hover:text-black transition">
                    Support Center
                  </button>
                </div>

                {/* ── Main content / Player ── */}
                <div className="flex-1 overflow-hidden">
                  <VideoPlayer
                    tutorial={activeTutorial}
                    onBack={() => setActiveTutorial(null)}
                    onSelect={(t) => setActiveTutorial(t)}
                  />
                </div>

                {/* ── Close Button ── */}
                <button
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition z-10"
                  onClick={onClose}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details
      className="group bg-white rounded-xl p-4 shadow-sm border border-gray-200"
      open={defaultOpen}
    >
      <summary className="flex items-center justify-between cursor-pointer text-gray-700 font-medium text-sm">
        {title}
        <ChevronDown className="w-4 h-4 transition group-open:rotate-180 flex-shrink-0" />
      </summary>
      {children}
    </details>
  );
}

// ── Sub Item ──────────────────────────────────────────────────────────────────
function SubItem({ index, title, type, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition text-left
        ${active ? "bg-blue-100 text-blue-700" : "bg-[#F3F6FA] text-gray-700 hover:bg-blue-50"}`}
    >
      <span className="text-sm">
        {index}. {title}
      </span>
      {type === "youtube" ? (
        <Youtube className="w-4 h-4 text-red-400 flex-shrink-0" />
      ) : (
        <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </button>
  );
}














// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, Play, X } from "lucide-react";

// export default function SidebarModal({ open, onClose }) {
//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[100]">
//           <motion.div
//             className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           <div className="absolute inset-0 pointer-events-none">
//             <motion.div
//               role="dialog"
//               aria-modal="true"
//               className="pointer-events-auto absolute top-6 bottom-6 right-12 w-[1300px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
//               initial={{ x: "110%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "110%" }}
//               transition={{ type: "spring", stiffness: 260, damping: 26 }}
//             >
//               <div className="relative flex w-full">
//                 {/* Blurred Content */}
//                 <div
//                   className="w-full flex"
//                   style={{
//                     filter: "blur(3px)",
//                     WebkitFilter: "blur(3px)",
//                   }}
//                 >
//                   {/* Sidebar */}
//                   <div className="w-[320px] bg-[#F7F9FC] border-r px-6 py-8 relative overflow-y-auto no-scrollbar">
//                     <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-blue-600">
//                       Just Catering X Tutorial
//                       <span className="w-5 h-5 bg-blue-500 rounded-full" />
//                     </h2>

//                     <div className="space-y-4">
//                       <Accordion title="How to create event?" defaultOpen />
//                       <Accordion title="How to prepare menu or menu planning?">
//                         <div className="mt-3 ml-2 space-y-2">
//                           <SubItem index="1" title="Create Menu" />
//                           <SubItem index="2" title="Custom Menu" />
//                         </div>
//                       </Accordion>
//                       <Accordion title="How to generate invoice?" />
//                       <Accordion title="How to make quotation?" />
//                     </div>

//                     <button className="absolute bottom-6 left-6 text-gray-500 text-sm hover:text-black transition">
//                       Support Center
//                     </button>
//                   </div>

//                   {/* Main content */}
//                   <div className="flex-1 px-10 py-10 overflow-y-auto">
//                     <div className="flex flex-col items-center mt-8 mb-10">
//                       <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
//                         🎓
//                       </div>
//                       <h1 className="text-3xl font-semibold mt-4 text-black">
//                         Welcome!
//                       </h1>
//                       <p className="text-[#646464] text-lg mt-1">
//                         What can we help you with?
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                       {[
//                         "How to create event?",
//                         "How to generate invoice?",
//                         "How to make quotation?",
//                         "How to generate menu report?",
//                       ].map((title, i) => (
//                         <div
//                           key={i}
//                           className="p-6 border rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center"
//                         >
//                           <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
//                             ▶
//                           </div>
//                           <p className="text-gray-700 font-medium text-center">
//                             {title}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Coming Soon Overlay */}
//                 <div
//                   className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
//                   style={{
//                     backgroundColor: "rgba(255, 255, 255, 0.3)",
//                     backdropFilter: "blur(2px)",
//                     zIndex: 100,
//                   }}
//                 >
//                   <div className="text-center px-8 py-6 rounded-2xl bg-white shadow-2xl border border-gray-200">
//                     <div className="mb-3">
//                       <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
//                         <Play className="w-8 h-8 text-blue-600" />
//                       </div>
//                     </div>
//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">
//                       Coming Soon
//                     </h3>
//                     <p className="text-sm text-gray-600 max-w-xs">
//                       Video tutorials are under development and will be
//                       available soon.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Close Button on top */}
//                 <button
//                   className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition"
//                   style={{ zIndex: 101 }}
//                   onClick={onClose}
//                 >
//                   <X className="w-4 h-4 text-gray-600" />
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }

// function Accordion({ title, children, defaultOpen = false }) {
//   return (
//     <details
//       className="group bg-white rounded-xl p-4 shadow-sm border border-gray-200"
//       open={defaultOpen}
//     >
//       <summary className="flex items-center justify-between cursor-pointer text-gray-700 font-medium">
//         {title}
//         <ChevronDown className="w-4 h-4 transition group-open:rotate-180" />
//       </summary>
//       {children}
//     </details>
//   );
// }

// function SubItem({ index, title }) {
//   return (
//     <div className="flex items-center justify-between bg-[#F3F6FA] px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
//       <span className="text-sm text-gray-700">
//         {index}. {title}
//       </span>
//       <Play className="w-4 h-4 text-gray-600" />
//     </div>
//   );
// }

// // Demo wrapper
// function Demo() {
//   const [open, setOpen] = React.useState(true);

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <button
//         onClick={() => setOpen(true)}
//         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//       >
//         Open Tutorial Modal
//       </button>
//       <SidebarModal open={open} onClose={() => setOpen(false)} />
//     </div>
//   );
// }