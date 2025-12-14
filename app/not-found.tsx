import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#09090b' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

      <div className="max-w-2xl w-full text-center relative z-10">

        {/* Logo 404 */}
        <div className="mb-8">
          <Image
            src="/logo404.png"
            alt="404 Error"
            width={250}
            height={250}
            className="mx-auto"
            priority
          />
        </div>

        {/* Text */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Hey!
        </h1>
        <p className="text-xl sm:text-2xl text-zinc-400 mb-8">
          You shouldn't be here. <br /> The page you're looking for doesn't exist.
        </p>

        {/* Back to home button */}
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
