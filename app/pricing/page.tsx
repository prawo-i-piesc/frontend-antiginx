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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section with Navigation */}
      <section className="relative min-h-[60vh] flex flex-col pt-2 lg:pt-6 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.08),transparent_50%)]"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

        {/* Floating Elements */}
        <div className="absolute top-16 left-8 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-cyan-600 rounded-full animate-pulse"></div>

        {/* Header */}
        <header className="top-0 z-50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2">
                  <Image
                    src="/logo.png"
                    alt="Antiginx Logo"
                    width={96}
                    height={32}
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-bold text-white">Antiginx</span>
                </Link>
              </div>
              <div className="flex items-center space-x-5">
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/#features" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Features</Link>
                  <Link href="/pricing" className="text-white transition-colors font-semibold text-sm">Pricing</Link>
                  <a href="#api" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">API</a>
                  <a href="#documentation" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Documentation</a>
                </nav>
                <Link href="/login" className="px-5 py-2 inline-block bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm">
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950">
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-zinc-800/50">
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
