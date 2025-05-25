
import { Link } from 'react-router-dom';
import './LandingPage.css';


const ChaoticElements = () => {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-20 animate-float"
                    style={{
                        width: `${Math.random() * 100 + 50}px`,
                        height: `${Math.random() * 100 + 50}px`,
                        backgroundColor: [
                            '#FF4D4D',
                            '#FFA64D',
                            '#4DA6FF',
                            '#FF4DFF',
                            '#E14DFF',
                        ][Math.floor(Math.random() * 5)],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 10 + 10}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>
    );
};

// Hero section
const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <ChaoticElements />
            <div className="max-w-5xl w-full space-y-8 text-center relative z-10">
                <div className="backdrop-blur-md bg-black/30 p-8 rounded-xl border border-red-500/30 shadow-xl shadow-red-500/10">
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              Team Sync
            </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-200 mb-8">
                        Level up your esports team with advanced scheduling and VOD reviews
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/team-management"
                            className="px-8 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition duration-300"
                        >
                            Team Management
                        </Link>
                        <button
                            className="px-8 py-3 text-lg font-medium rounded-full bg-gray-800 text-white border border-pink-500/30 hover:bg-gray-700 transform hover:scale-105 transition duration-300"
                        >
                            Watch Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Feature card
const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-pink-500/20 shadow-lg hover:shadow-pink-500/10 transform hover:scale-105 transition duration-300">
            <div className="text-pink-500 text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300">{description}</p>
        </div>
    );
};

// Features section
const Features = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">
                    Unleash Your Team's Potential
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="📅"
                        title="Smart Scheduling"
                        description="AI-powered scheduling that works around your team's availability and optimizes practice time."
                    />
                    <FeatureCard
                        icon="🎮"
                        title="VOD Analysis"
                        description="Deep-dive into your matches with frame-by-frame analysis tools and automated highlights."
                    />
                    <FeatureCard
                        icon="📊"
                        title="Performance Tracking"
                        description="Track individual and team metrics to identify strengths and areas for improvement."
                    />
                    <FeatureCard
                        icon="💬"
                        title="Team Communication"
                        description="Built-in messaging and notification system to keep everyone in sync."
                    />
                    <FeatureCard
                        icon="🔄"
                        title="Integration"
                        description="Seamlessly connect with Discord, Twitch, and other platforms your team already uses."
                    />
                    <FeatureCard
                        icon="🚀"
                        title="Strategy Builder"
                        description="Collaborative tools to create, share, and refine team strategies and tactics."
                    />
                </div>
            </div>
        </section>
    );
};

// CTA
const CTA = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-red-900/40 to-pink-900/40 -z-10"></div>
            <ChaoticElements />
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="backdrop-blur-md bg-black/30 p-8 rounded-xl border border-blue-500/30 shadow-xl">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Ready to Dominate?</h2>
                    <p className="text-xl text-gray-200 mb-8">
                        Join the top esports teams already using our platform to level up their game.
                    </p>
                    <button className="px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition duration-300">
                        Get Started for Free
                    </button>
                </div>
            </div>
        </section>
    );
};

// Footer
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Team Sync</h3>
                    <p>Empowering esports teams with cutting-edge tools for scheduling and VOD review.</p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-pink-400 transition">Scheduling</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">VOD Review</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Team Management</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Analytics</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-pink-400 transition">Documentation</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">API</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Blog</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Community</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-pink-400 transition">Twitter</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Discord</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Twitch</a></li>
                        <li><a href="#" className="hover:text-pink-400 transition">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center">
                <p>&copy; {new Date().getFullYear()} Team Sync. All rights reserved.</p>
            </div>
        </footer>
    );
};

// Main Landing Page
// Main Landing Page
const LandingPage = () => {
    return (
        <div className="bg-gray-900 text-white min-h-screen overflow-hidden">
            <nav className="bg-gray-900/80 backdrop-blur-md fixed w-full z-50 border-b border-pink-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                Team Sync
              </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <a href="#features" className="px-3 py-2 text-gray-300 hover:text-white transition">Features</a>
                            <a href="#pricing" className="px-3 py-2 text-gray-300 hover:text-white transition">Pricing</a>
                            <a href="#testimonials" className="px-3 py-2 text-gray-300 hover:text-white transition">Testimonials</a>
                            <Link to="/dashboard" className="px-3 py-2 text-gray-300 hover:text-white transition">Dashboard</Link>
                            <Link
                                to="/auth"
                                className="ml-4 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 transform hover:scale-105 transition duration-300"
                            >
                                Sign Up
                            </Link>
                        </div>
                        <div className="md:hidden flex items-center">
                            <button className="text-gray-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Hero />
                <Features />
                <CTA />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;