import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/front1.jpg";
import featuresImage from "@/assets/frontman.jpg";
import howItWorksImage from "@/assets/front3g.jpg";
import { ShoppingBag, Shield, Zap, CreditCard } from "lucide-react";
import { memo } from "react";

/**
 * Index Page – LegitStore Landing Page
 * Modern, semantic, and accessible version without altering the UI.
 */
const Index = () => {
  const navigate = useNavigate();

  return (
  <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden transition-colors duration-300">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      {/* 🧭 Navbar */}
      <Navbar />

      {/* 🏠 Hero Section */}
      <section
        id="home"
        className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-6 overflow-hidden"
        aria-label="Welcome to LegitStore"
      >
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 📝 Hero Text */}
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl lg:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Welcome to
                </h3>
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-2xl"
                  style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
                >
                  Legit Store
                </h1>
              </div>

              <p className="text-base md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed">
                Your trusted marketplace for <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">authentic social media accounts</span> designed to last and serve you better.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  aria-label="Get started on LegitStore"
                  className="h-12 md:h-14 px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base md:text-lg font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.05] rounded-xl w-full sm:w-auto"
                >
                  <span className="flex items-center gap-2 justify-center">
                    Get Started
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  aria-label="Learn more about LegitStore"
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold border-2 border-purple-300 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 rounded-xl w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* 🖼 Hero Image */}
            <figure className="relative group animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-3 md:p-6 rounded-3xl shadow-2xl border-2 border-white/60">
                <img
                  src={heroImage}
                  alt="Modern shopping experience on LegitStore"
                  className="rounded-2xl w-full h-48 md:h-auto object-cover animate-float shadow-xl"
                  loading="lazy"
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ℹ️ About Section */}
      <section id="about" className="py-16 md:py-24 px-6 relative" aria-labelledby="about-title">
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Features Grid */}
            <div className="order-2 md:order-1 grid grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-left duration-700">
              {[
                {
                  icon: <ShoppingBag className="h-6 w-6 md:h-10 md:w-10 mb-3 md:mb-4" />,
                  title: "Quality Products",
                  desc: "Curated selection of premium items.",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Shield className="h-6 w-6 md:h-10 md:w-10 mb-3 md:mb-4" />,
                  title: "Secure Shopping",
                  desc: "Your data is always protected.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: <Zap className="h-6 w-6 md:h-10 md:w-10 mb-3 md:mb-4" />,
                  title: "Fast Delivery",
                  desc: "We deliver immediately after purchase.",
                  gradient: "from-orange-500 to-red-500"
                },
                {
                  icon: <CreditCard className="h-6 w-6 md:h-10 md:w-10 mb-3 md:mb-4" />,
                  title: "Easy Payments",
                  desc: "Multiple payment options.",
                  gradient: "from-green-500 to-emerald-500"
                },
              ].map((feature, i) => (
                <article
                  key={i}
                  className="group bg-white/80 backdrop-blur-xl p-4 md:p-8 rounded-2xl shadow-xl border-2 border-white/60 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-br ${feature.gradient} relative z-10`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-800 relative z-10">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 relative z-10 leading-snug">{feature.desc}</p>
                </article>
              ))}
            </div>

            {/* About Text */}
            <div className="order-1 md:order-2 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right duration-700">
              <div className="relative inline-block">
                <h2 
                  id="about-title" 
                  className="text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative z-10"
                  style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
                >
                  About LegitStore
                </h2>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-2xl rounded-lg -z-10 animate-pulse"></div>
              </div>
              <p className="text-sm md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                We offer a wide range of accounts tailored to various needs. Professional social media growth services
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">   Foreign & local Facebook • Instagram • TikTok • YouTube • Twitter,
                  Virtual numbers for verification WhatsApp • Telegram • SMS • OTP. </span>, We will help you gain more followers and boost your account.
                 We also sell, Discord Accounts, Old email, Twitch, and many more.
              </p>
              <p
                className="text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed tracking-wide"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                With thousands of satisfied customers worldwide, we've built a
                reputation for <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">reliability, quality, and customer satisfaction</span>. Join our community today and experience the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Features Section */}
      <section id="features" className="py-16 md:py-24 px-6 relative" aria-labelledby="features-title">
        <div className="container mx-auto relative z-10">
          <header className="text-center mb-12 md:mb-20 animate-in fade-in slide-in-from-top duration-700">
            <h2 
              id="features-title" 
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
              style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
            >
              Powerful Features
            </h2>
            <p className="text-base md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need for a <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">seamless shopping experience</span>.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left duration-700">
              {[
                {
                  title: "Smart Shopping Cart",
                  desc: "Easily manage purchases, save items for later, and checkout in seconds.",
                  gradient: "from-blue-600 to-cyan-600"
                },
                {
                  title: "Wallet System",
                  desc: "Add funds and enjoy faster checkouts. Your balance stays secure and ready anytime.",
                  gradient: "from-purple-600 to-pink-600"
                },
                {
                  title: "Instant Updates",
                  desc: "Receive real-time notifications about orders, offers, and new arrivals.",
                  gradient: "from-orange-600 to-red-600"
                },
              ].map((item, i) => (
                <div key={i} className="group bg-white/80 backdrop-blur-xl p-5 md:p-8 rounded-2xl shadow-xl border-2 border-white/60 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                  <h3 className={`text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r ${item.gradient}`}>{item.title}</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <figure className="relative group animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-3 md:p-6 rounded-3xl shadow-2xl border-2 border-white/60">
                                <img
                  src={featuresImage}
                  alt="Features overview"
                  className="rounded-2xl shadow-xl w-full h-48 md:h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ⚙️ How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-6 relative" aria-labelledby="how-title">
        <div className="container mx-auto relative z-10">
          <header className="text-center mb-12 md:mb-20 animate-in fade-in slide-in-from-top duration-700">
            <h2 
              id="how-title" 
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
              style={{ fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}
            >
              How It Works
            </h2>
            <p className="text-base md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Getting started is <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">simple and intuitive</span>. Follow these easy steps.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <figure className="relative group animate-in fade-in slide-in-from-left duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md p-3 md:p-6 rounded-3xl shadow-2xl border-2 border-white/60">
                <img
                  src={howItWorksImage}
                  alt="How LegitStore works"
                  className="rounded-2xl shadow-xl w-full h-48 md:h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </figure>

            <ol className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-right duration-700" aria-label="Steps to start using LegitStore">
              {[
                {
                  step: 1,
                  title: "Create Your Account",
                  gradient: "from-blue-600 to-cyan-600",
                  desc: "Sign up in seconds with your email. No complex forms or waiting periods.",
                },
                {
                  step: 2,
                  title: "Browse & Select",
                  gradient: "from-purple-600 to-pink-600",
                  desc: "Explore our curated collection and add your favorite items to your cart.",
                },
                {
                  step: 3,
                  title: "Add Funds & Checkout",
                  gradient: "from-orange-600 to-red-600",
                  desc: "Top up your wallet and complete purchases securely with one click.",
                },
                {
                  step: 4,
                  title: "Enjoy Your Purchase",
                  gradient: "from-green-600 to-emerald-600",
                  desc: "Relax while we prepare and ship your order directly to your door.",
                },
              ].map(({ step, title, desc, gradient }) => (
                <li key={step} className="flex gap-4 md:gap-6 group">
                  <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold text-lg md:text-2xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {step}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>{title}</h3>
                    <p className="text-sm md:text-lg text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 📜 Footer */}
      <footer className="py-12 px-6 border-t border-white/40 mt-auto backdrop-blur-sm relative z-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
            &copy; {new Date().getFullYear()} <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">LegitStore</span>. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Social Support Icons */}
      <div className="fixed bottom-8 left-6 z-50">
        <a
          href="https://chat.whatsapp.com/Jyr22tl4NNA6GJ5dXIpAlv?mode=wwt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          aria-label="Contact us on WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>

      <div className="fixed bottom-8 right-6 z-50">
        <a
          href="https://t.me/@Legit_support1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
          aria-label="Contact us on Telegram"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-2xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow">online agent</span>
        </a>
      </div>
    </main>
  );
};

export default memo(Index);
