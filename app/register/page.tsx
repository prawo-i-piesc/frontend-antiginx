import RegisterForm from '../components/RegisterForm';
import Footer from '../components/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#09090b' }}>
      <section className="relative min-h-screen flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)] opacity-40"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-13s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[40%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-5s', animationDuration: '14s'}}></div>
          <div className="absolute bottom-0 left-[60%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-7s', animationDuration: '15s'}}></div>
          <div className="absolute bottom-0 left-[80%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-14s', animationDuration: '20s'}}></div>
          <div className="absolute bottom-0 left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-2s', animationDuration: '16s'}}></div>
          <div className="absolute bottom-0 left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '18s'}}></div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <RegisterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
