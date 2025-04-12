import React from 'react'
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Globe, Lock } from 'lucide-react'
import Navbar from './components/Navbar'
export default function TextileBlockchainLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-primary">Revolutionizing Textile Supply Chains with Blockchain</h1>
              <p className="text-xl text-muted-foreground">
                A decentralized platform that connects farmers, mills, manufacturers, and retailers in a transparent, efficient, and sustainable textile ecosystem.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button className="flex items-center justify-center px-6 py-3 text-white rounded-md bg-primary hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="px-6 py-3 border rounded-md border-primary text-primary hover:bg-primary/10">Learn More</button>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg shadow-xl bg-primary/80 h-96">
              <div className="p-6 text-center text-white">
                <Shield className="w-20 h-20 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold">Secure. Transparent. Efficient.</h3>
                <p className="max-w-md mx-auto mt-2">Our blockchain solution brings unprecedented transparency to every step of the textile production journey.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-primary">Key Features</h2>
            <p className="mt-4 text-xl text-muted-foreground">Everything you need to manage your textile supply chain</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<Shield className="w-10 h-10 text-primary" />} title="Transparency" description="Track every step of your textile production with immutable blockchain records." />
            <FeatureCard icon={<BarChart3 className="w-10 h-10 text-primary" />} title="Analytics" description="Gain insights into your supply chain performance with real-time data." />
            <FeatureCard icon={<Users className="w-10 h-10 text-primary" />} title="Collaboration" description="Connect with all stakeholders in your supply chain through a single platform." />
            <FeatureCard icon={<Globe className="w-10 h-10 text-primary" />} title="Sustainability" description="Monitor and improve your environmental impact with detailed tracking." />
            <FeatureCard icon={<Lock className="w-10 h-10 text-primary" />} title="Security" description="Your data is protected with enterprise-grade security and encryption." />
            <FeatureCard icon={<CheckCircle className="w-10 h-10 text-primary" />} title="Compliance" description="Ensure compliance with industry standards and regulations." />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 rounded-lg shadow-xl bg-primary/90 h-96">
              <div className="text-white">
                <h3 className="mb-6 text-2xl font-bold">Transform Your Supply Chain</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <span>Reduce production time by up to 40%</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <span>Decrease operational costs by 25%</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <span>Improve supply chain visibility by 80%</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <span>Enhance customer trust through transparency</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">Why Choose Our Platform?</h2>
              <div className="space-y-4">
                <BenefitItem title="Reduce Costs" description="Eliminate intermediaries and streamline operations to reduce overall costs." />
                <BenefitItem title="Increase Efficiency" description="Automate processes and reduce manual work with smart contracts." />
                <BenefitItem title="Build Trust" description="Create transparency and build trust with all stakeholders in your supply chain." />
                <BenefitItem title="Meet Consumer Demands" description="Respond to growing consumer demand for sustainable and ethical products." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white bg-primary">
        <div className="px-6 mx-auto text-center max-w-7xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Supply Chain?</h2>
          <p className="max-w-3xl mx-auto mb-8 text-xl">Join the future of textile supply chain management with our decentralized platform.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="px-6 py-3 bg-white rounded-md text-primary hover:bg-white/90">Register Now</button>
            <button className="px-6 py-3 text-white border border-white rounded-md bg-white/10 hover:bg-white/20">Schedule Demo</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold text-primary">TextileChain</div>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                Features
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                Contact
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                Privacy
              </a>
            </div>
          </div>
          <div className="mt-8 text-sm text-center text-muted-foreground">© {new Date().getFullYear()} Decentralized Textile Supply Chain. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="p-6 transition-shadow border rounded-lg shadow-sm bg-card border-border hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

// Benefit Item Component
const BenefitItem = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex gap-3">
      <CheckCircle className="w-6 h-6 mt-1 text-primary shrink-0" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
