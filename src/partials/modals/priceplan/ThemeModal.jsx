import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toAbsoluteUrl } from "@/utils";

const ThemeModal = ({ open, onClose, onAddTheme, onSkipTheme }) => {
  const themes = [
    {
      id: 1,
      name: "First Page",
      image: toAbsoluteUrl("/media/images/Main.png"),
    },
    {
      id: 2,
      name: "Second Page",
      image: toAbsoluteUrl("/media/images/Detail.png"),
    },
    {
      id: 3,
      name: "Details Page",
      image: toAbsoluteUrl("/media/images/Watermark.png"),
    },
    {
      id: 4,
      name: "Last Page",
      image: toAbsoluteUrl("/media/images/Last.png"),
    },
  ];

  useEffect(() => {
    if (open) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[1000px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="px-6 pt-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    Custom Themes
                  </p>
                  <p className="text-sm text-gray-600 mb-6">
                    Upgrade your software with premium, brand-matched designs
                  </p>
                </div>
                <button
                  className="h-9 px-4 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  autoFocus
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* Theme Gallery */}
                <div className="rounded-lg p-4 mb-6">
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className="text-center flex-shrink-0 w-[280px]"
                      >
                        <div className="bg-gray-100 rounded-lg aspect-[3/4] mb-2 flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
                            <img
                              src={theme.image}
                              alt={theme.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {theme.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Why Should You Purchase Custom Theme?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          Full app color customization
                        </h4>
                        <p className="text-md text-gray-700">
                          Tailor every element to your brand
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          Brand-matched UI
                        </h4>
                        <p className="text-md text-gray-600">
                          Create a seamless brand experience
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          Light & dark mode options
                        </h4>
                        <p className="text-md text-gray-600">
                          A great experience, day or night
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          Professional & premium look
                        </h4>
                        <p className="text-md text-gray-600">
                          Impress your clients and team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
                <button
                  className="flex-1 h-11 rounded-lg bg-[#005BA8] text-white font-semibold hover:bg-[#005BA8]"
                  onClick={onAddTheme}
                >
                  Add Custom Theme At ₹6,000 →
                </button>

                <button
                  className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={onSkipTheme}
                >
                  Continue without Add-On →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThemeModal;
