import RegisterForm from '../components/RegisterForm';
import Footer from '../components/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="relative min-h-screen flex flex-col">
        {/* Darker hero-like background layers (same style as login) */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.015)_1px,transparent_1px)] bg-size-[40px_40px] opacity-60"></div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <RegisterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
