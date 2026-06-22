import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">

      {/* Hamburger Button */}
      <button
        className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-white/10 
                   backdrop-blur-md border border-white/20 hover:bg-white/20 
                   transition-all flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          {/* Top Line */}
          <span
            className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
              ${isOpen ? "rotate-45" : "-translate-y-2"}
            `}
          ></span>

          {/* Middle Line */}
          <span
            className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
              ${isOpen ? "opacity-0" : "opacity-100"}
            `}
          ></span>

          {/* Bottom Line */}
          <span
            className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
              ${isOpen ? "-rotate-45" : "translate-y-2"}
            `}
          ></span>
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-xl 
                    border-r border-white/20 transform transition-all duration-300 z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 space-y-6">

          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br 
                            from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Energy Portal</h1>
              <p className="text-xs text-gray-300">Admin Panel</p>
            </div>
          </div>

          <hr className="border-white/20" />

          {/* Menu */}
          <nav className="space-y-6 text-white text-lg">

            {/* Homepage */}
            <Link to="/homepage" className="flex items-center gap-3 hover:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 9.75l9-6 9 6M4.5 10v9.75A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.25V10" />
              </svg>
              Homepage
            </Link>

            {/* Dashboard */}
            <Link to="/dashboard" className="flex items-center gap-3 hover:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
              </svg>
              Dashboard
            </Link>

            {/* Reports */}
            <Link to="/reports" className="flex items-center gap-3 hover:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"
                className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-5-5H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 3v4h4" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 13h6M9 17h6M9 9h2" />
              </svg>
              Reports
            </Link>


            {/* FAQs */}
            <Link to="/faqs" className="flex items-center gap-3 hover:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8"
                className="w-6 h-6">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 16h.01" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 12.5a2 2 0 10-2-2" />
              </svg>
              FAQs
            </Link>


          </nav>


          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            {/* <button
              onClick={() => {
                // later: clear tokens, navigate to login
                window.location.href = "/";
                // navigate("/homepage");
                toast.success("Logged out successfully");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 
               bg-white/10 text-white rounded-lg 
               hover:bg-white/20 transition-all
               border border-white/20 backdrop-blur-md"
            > */}
            <button
              onClick={() => {
                toast.success("Logged out successfully");

                // small delay so toast is visible before navigation
                setTimeout(() => {
                  navigate("/");
                }, 300);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 
             bg-white/10 text-white rounded-lg 
             hover:bg-white/20 transition-all
             border border-white/20 backdrop-blur-md"
            >

              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 12H3m0 0l4-4m-4 4l4 4M21 4h-6m6 0a2 2 0 012 2v12a2 2 0 01-2 2h-6" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Page Content */}
      <div className="min-h-screen">{children}</div>
      <Footer />
    </div>
  );
}



// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import Footer from "./Footer";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// export default function Layout({ children }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const navigate = useNavigate();

//   /*
//    * ── Z-INDEX LAYER PLAN ───────────────────────────────────────────
//    *
//    *  z-[100]  Hamburger button        (always on top of everything)
//    *  z-[90]   Sidebar panel           (above backdrop + page content)
//    *  z-[80]   Backdrop overlay        (above page, below sidebar)
//    *  z-[40]   Dashboard sticky navbar (inside page content — OK here)
//    *
//    *  ROOT CAUSE that was broken:
//    *  The Dashboard's Navbar had inline style `zIndex: 40`, which
//    *  creates a NEW stacking context for everything rendered inside
//    *  <Layout>. That stacking context had z-index 40, so the sidebar
//    *  (Tailwind z-50 = z-index 50 relative to the DOCUMENT root) was
//    *  still being evaluated relative to the wrong parent, causing it
//    *  to appear behind the dashboard content in some browsers.
//    *
//    *  The real fix: the Layout root div must NOT create a stacking
//    *  context itself (no transform/opacity/filter on it), and all
//    *  overlay elements (sidebar, backdrop, hamburger) must use
//    *  `position: fixed` with z-indexes high enough to clear any
//    *  stacking context created by children.
//    *
//    *  Using z-[80]/z-[90]/z-[100] (800/900/1000) guarantees they
//    *  always sit above any z-index a child page might set (like 40).
//    * ────────────────────────────────────────────────────────────────
//    */

//   return (
//     // ── Root: relative, no stacking context (no transform/opacity) ──
//     <div className="relative min-h-screen">

//       {/* ── Hamburger Button — always topmost ── */}
//       <button
//         className="fixed top-4 left-4 z-[100] p-3 rounded-xl bg-white/10
//                    backdrop-blur-md border border-white/20 hover:bg-white/20
//                    transition-all flex items-center justify-center"
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label={isOpen ? "Close menu" : "Open menu"}
//       >
//         <div className="relative w-6 h-6 flex items-center justify-center">
//           {/* Top line */}
//           <span className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300
//             ${isOpen ? "rotate-45" : "-translate-y-2"}`}
//           />
//           {/* Middle line */}
//           <span className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300
//             ${isOpen ? "opacity-0" : "opacity-100"}`}
//           />
//           {/* Bottom line */}
//           <span className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300
//             ${isOpen ? "-rotate-45" : "translate-y-2"}`}
//           />
//         </div>
//       </button>

//       {/* ── Backdrop — closes sidebar on click, sits below sidebar ── */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-[80]"
//           onClick={() => setIsOpen(false)}
//         />
//       )}

//       {/* ── Sidebar panel ── */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-xl
//                     border-r border-white/20 transform transition-all duration-300
//                     z-[90]
//                     ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="p-6 space-y-6">

//           {/* Logo + title */}
//           <div className="flex items-center space-x-3 pt-2">
//             <div className="h-10 w-10 rounded-xl bg-gradient-to-br
//                             from-green-400 to-blue-500 flex items-center
//                             justify-center shadow-lg flex-shrink-0">
//               <span className="text-white text-2xl font-bold">⚡</span>
//             </div>
//             <div>
//               <h1 className="text-lg font-semibold text-white">Energy Portal</h1>
//               <p className="text-xs text-gray-300">Admin Panel</p>
//             </div>
//           </div>

//           <hr className="border-white/20" />

//           {/* Nav links */}
//           <nav className="space-y-6 text-white text-lg">

//             <Link
//               to="/homepage"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center gap-3 hover:text-green-300 transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
//                 className="w-5 h-5 flex-shrink-0">
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M3 9.75l9-6 9 6M4.5 10v9.75A1.5 1.5 0 006 21h12a1.5 1.5
//                      0 001.5-1.25V10" />
//               </svg>
//               Homepage
//             </Link>

//             <Link
//               to="/dashboard"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center gap-3 hover:text-green-300 transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
//                 className="w-5 h-5 flex-shrink-0">
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
//               </svg>
//               Dashboard
//             </Link>

//             <Link
//               to="/reports"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center gap-3 hover:text-green-300 transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
//                 className="w-6 h-6 flex-shrink-0">
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M19 7l-5-5H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0
//                      002-2V7z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v4h4" />
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M9 13h6M9 17h6M9 9h2" />
//               </svg>
//               Reports
//             </Link>

//             <Link
//               to="/faqs"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center gap-3 hover:text-green-300 transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
//                 className="w-6 h-6 flex-shrink-0">
//                 <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 16h.01" />
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M12 12.5a2 2 0 10-2-2" />
//               </svg>
//               FAQs
//             </Link>

//           </nav>

//           {/* Logout */}
//           <div className="absolute bottom-6 left-6 right-6">
//             <button
//               onClick={() => {
//                 setIsOpen(false);
//                 toast.success("Logged out successfully");
//                 setTimeout(() => navigate("/"), 300);
//               }}
//               className="w-full flex items-center gap-3 px-4 py-2
//                          bg-white/10 text-white rounded-lg
//                          hover:bg-white/20 transition-all
//                          border border-white/20 backdrop-blur-md"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none"
//                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
//                 className="w-5 h-5 flex-shrink-0">
//                 <path strokeLinecap="round" strokeLinejoin="round"
//                   d="M15 12H3m0 0l4-4m-4 4l4 4M21 4h-6m6 0a2 2 0
//                      012 2v12a2 2 0 01-2 2h-6" />
//               </svg>
//               Logout
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* ── Page content ── */}
//       <div className="min-h-screen">
//         {children}
//       </div>

//       <Footer />
//     </div>
//   );
// }
