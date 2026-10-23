import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-600/30">
            +
          </span>
          <span className="text-2xl font-black tracking-tight">
            Dac<span className="text-teal-600 dark:text-teal-400">Sahab</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-2xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-semibold">
            <span>🩺</span>
            <span>Online Doctor Consultations For Any Illness</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Connect with certified doctors <span className="text-teal-600 dark:text-teal-400">in minutes.</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            DacSahab makes healthcare accessible anywhere. Consult top specialists, book appointments, and receive secure medical prescriptions online.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              Sign In to DacSahab
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              Create Account
            </Link>
          </div>

          {/* Quick specs pill badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">24 / 7</p>
              <p className="text-xs text-slate-500">Virtual Care</p>
            </div>
            <div>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">Verified</p>
              <p className="text-xs text-slate-500">Certified Doctors</p>
            </div>
            <div>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400">Secure</p>
              <p className="text-xs text-slate-500">Health Privacy</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="flex-1 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative bg-slate-900 group">
          <Image
            src="/dacsahab_banner.jpg"
            alt="Doctor Consultation Preview"
            width={600}
            height={450}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/80 text-white uppercase tracking-wider">
                Preview Mode
              </span>
              <p className="mt-1 text-sm font-medium text-white">
                Login & Signup skeletons ready for user & doctor roles
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; 2026 DacSahab. All rights reserved.
      </footer>
    </div>
  );
}
