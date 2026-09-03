import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useSettings } from "@/providers/SettingsProvider";
import { AppRouting } from "@/routing";
import { PathnameProvider } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import useVisibilityShortcut from "./hooks/useVisibilityShortcut";

const { BASE_URL } = import.meta.env;

const AppContent = () => {

  const userId = localStorage.getItem("userId");
  useVisibilityShortcut(userId);
  return (
    <>
      <PathnameProvider>
        <AppRouting />
      </PathnameProvider>
      <Toaster />
    </>
  );
};

const router = createBrowserRouter([{ path: "*", element: <AppContent /> }], {
  basename: BASE_URL,
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
  },
});

const App = () => {
  const { settings } = useSettings();
  

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add(settings.themeMode);
  }, [settings]);

  return <RouterProvider router={router} />;
};

export { App };

// import { useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import { useSettings } from '@/providers/SettingsProvider';
// import { AppRouting } from '@/routing';
// import { PathnameProvider } from '@/providers';
// import { Toaster } from '@/components/ui/sonner';
// const {
//   BASE_URL
// } = import.meta.env;
// const App = () => {
//   const {
//     settings
//   } = useSettings();
//   useEffect(() => {
//     document.documentElement.classList.remove('dark');
//     document.documentElement.classList.remove('light');
//     document.documentElement.classList.add(settings.themeMode);
//   }, [settings]);
//   return <BrowserRouter basename={BASE_URL} future={{
//     v7_relativeSplatPath: true,
//     v7_startTransition: true
//   }}>
//       <PathnameProvider>
//         <AppRouting />
//       </PathnameProvider>
//       <Toaster />
//     </BrowserRouter>;
// };
// export { App };
