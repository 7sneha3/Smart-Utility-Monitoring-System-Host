export default function Footer() {
    return (
      <footer
        className="
          w-full text-center py-4 text-sm text-white/70
          bg-gradient-to-r from-green-900/100 via-slate-900/100 to-blue-900/100
          border-t border-white/10
        "
      >
        © {new Date().getFullYear()} Smart Utility Monitoring System. All rights reserved.
      </footer>
    );
  }
  