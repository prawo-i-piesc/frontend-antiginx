"use client";

import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for personal use and testing",
      features: [
        "10 scans per day",
        "Basic threat detection",
        "Email support",
        "Community access",
        "Basic reports",
      ],
      cta: "Get Started",
      popular: false,
      disabled: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "Best for professionals and small teams",
      features: [
        "Unlimited scans",
        "Advanced threat detection",
        "Priority support 24/7",
        "API access",
        "Detailed analytics",
        "Custom alerts",
        "Export reports (PDF/CSV)"
      ],
      cta: "Start Free Trial",
      popular: true,
      disabled: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced security features",
        "Custom training & onboarding"
      ],
      cta: "Contact Sales",
      popular: false,
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#09090b' }}>
      {/* Hero Section with Navigation */}
      <section className="relative min-h-[60vh] flex flex-col pt-2 lg:pt-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)] opacity-40"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-2s', animationDuration: '16s'}}></div>
          <div className="absolute bottom-0 left-[30%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '19s'}}></div>
          <div className="absolute bottom-0 left-[50%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[70%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '18s'}}></div>
        </div>

        {/* Header */}
        <header className="top-0 z-50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logotype.png"
                    alt="Antiginx Logo"
                    width={150}
                    height={60}
                    className="h-8 sm:h-10 md:h-12 w-auto"
                  />
                </Link>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-5">
                <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                  <Link href="/#features" className="text-shadow-white hover:text-white transition-colors font-normal text-sm">Features</Link>
                  <a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-shadow-white hover:text-white transition-colors font-normal text-sm">Documentation</a>
                </nav>
                <Link href="/login" className="px-4 sm:px-5 py-1.5 sm:py-2 inline-block bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 whitespace-nowrap cursor-pointer font-medium text-xs sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-sm">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center py-16">
          <div className="mb-0">
            <h1 className="text-5xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Simple, <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">transparent</span> pricing
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your needs. Always know what you&apos;ll pay.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-linear-to-b from-zinc-800 to-zinc-900 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                    : 'bg-zinc-900 border border-zinc-800'
                } transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-zinc-400 ml-2">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-cyan-500 mr-3 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-zinc-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={plan.disabled}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-linear-to-r from-cyan-600 to-cyan-700 text-white hover:from-cyan-700 hover:to-cyan-800 shadow-lg hover:shadow-xl'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Frequently Asked <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Questions</span>
          </h2>

          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Can I switch plans later?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">What happens after my trial ends?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                After your trial ends, you&apos;ll automatically be downgraded to the Free plan unless you choose to subscribe to a paid plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
