import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#09090b' }}>
      <section className="relative min-h-screen flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)] opacity-40"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-[15%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[35%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-12s', animationDuration: '20s'}}></div>
          <div className="absolute bottom-0 left-[55%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[75%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-9s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '16s'}}></div>
          <div className="absolute bottom-0 left-[85%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '19s'}}></div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
