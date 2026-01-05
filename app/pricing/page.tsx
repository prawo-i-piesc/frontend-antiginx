"use client";

import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

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
      <section className="relative min-h-[45vh] flex flex-col pt-2 lg:pt-6">
        {/* Animated Background */}
        <div className="absolute inset-0" style={{ backgroundColor: '#09090b' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,140,190,0.13),transparent_90%)]"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:120px_120px]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-[5%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-5s', animationDuration: '15s'}}></div>
          <div className="absolute bottom-0 left-[15%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '16s'}}></div>
          <div className="absolute bottom-0 left-[35%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-12s', animationDuration: '20s'}}></div>
          <div className="absolute bottom-0 left-[45%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-7s', animationDuration: '14s'}}></div>
          <div className="absolute bottom-0 left-[55%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[65%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-4s', animationDuration: '15s'}}></div>
          <div className="absolute bottom-0 left-[75%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-9s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[85%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '19s'}}></div>
          <div className="absolute bottom-0 left-[95%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-11s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-2s', animationDuration: '16s'}}></div>
          <div className="absolute bottom-0 left-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-13s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[30%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '19s'}}></div>
          <div className="absolute bottom-0 left-[40%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-5s', animationDuration: '14s'}}></div>
          <div className="absolute bottom-0 left-[50%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[60%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-7s', animationDuration: '15s'}}></div>
          <div className="absolute bottom-0 left-[70%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '17s'}}></div>
          <div className="absolute bottom-0 left-[80%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-14s', animationDuration: '20s'}}></div>
          <div className="absolute bottom-0 left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '18s'}}></div>
          <div className="absolute bottom-0 left-[8%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-9s', animationDuration: '16s'}}></div>
        </div>

        {/* Header */}
        <motion.header 
          className="top-0 z-50 relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logotype.png"
                    alt="Antiginx Logo"
                    width={100}
                    height={40}
                    className="h-4 sm:h-10 md:h-9 w-auto hover:scale-101 transition-transform duration-200"
                  />
                </Link>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-5">
                <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                  <Link href="/#features" className="text-shadow-white hover:text-cyan-300 transition-colors font-normal text-sm duration-300">Features</Link>
                  <a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Documentation</a>
                  <a href="/pricing" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Pricing</a>
                </nav>
                <Link href="/login" className="px-4 sm:px-5 py-1.5 sm:py-2 inline-block bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 whitespace-nowrap cursor-pointer font-medium text-xs sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-sm">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Content */}
        <div className="relative z-10 pb-20 mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center pt-10">
          <div className="mb-0">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-linear-to-r from-zinc-200 to-zinc-300 bg-clip-text text-transparent mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Simple, <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">transparent</span> pricing
            </motion.h1>

            <motion.p 
              className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              Choose the perfect plan for your needs. Always know what you&apos;ll pay.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-4 pb-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#09090b' }}>

        <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl p-8 lg:p-10 ${
                  plan.popular
                    ? 'bg-zinc-900/60 border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-sm scale-105'
                    : 'bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm'
                } hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]`}
                style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-xs font-bold rounded-full shadow-lg">
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
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_0_rgba(6,182,212,0.35)]'
                      : 'bg-zinc-800/80 text-white hover:bg-zinc-700/80 border border-zinc-700/50'
                  } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/30" style={{ backgroundColor: '#09090b' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-12 text-zinc-200">
            Frequently Asked <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Questions</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-3">Can I switch plans later?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-3">What happens after my trial ends?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                After your trial ends, you&apos;ll automatically be downgraded to the Free plan unless you choose to subscribe to a paid plan.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-white mb-3">Can I cancel anytime?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Absolutely. You can cancel your subscription at any time with no penalties or fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#09090b' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,182,212,0.1),transparent)]" style={{ zIndex: 0 }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative" style={{ zIndex: 1 }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-200 mb-4 sm:mb-6">
            Ready to <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">get started?</span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Start protecting your websites today with our free plan. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all duration-200 font-semibold shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_0_rgba(6,182,212,0.35)] whitespace-nowrap cursor-pointer text-sm sm:text-base"
            >
              Start Free Trial
            </Link>
            <Link
              href="/#scanner"
              className="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-semibold border border-white/20 hover:border-white/40 backdrop-blur-sm whitespace-nowrap cursor-pointer text-sm sm:text-base"
            >
              Try Scanner
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
