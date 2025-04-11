import React from 'react'
import Navbar from './components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Globe, Lock } from 'lucide-react'

const Page = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">Revolutionizing Textile Supply Chains with Blockchain</h1>
              <p className="text-xl text-muted-foreground">
                A decentralized platform that connects farmers, mills, manufacturers, and retailers in a transparent, efficient, and sustainable textile ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image src="/supply-chain.jpg" alt="Textile Supply Chain" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Key Features</h2>
            <p className="mt-4 text-xl text-muted-foreground">Everything you need to manage your textile supply chain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Shield className="h-10 w-10 text-primary" />} title="Transparency" description="Track every step of your textile production with immutable blockchain records." />
            <FeatureCard icon={<BarChart3 className="h-10 w-10 text-primary" />} title="Analytics" description="Gain insights into your supply chain performance with real-time data." />
            <FeatureCard icon={<Users className="h-10 w-10 text-primary" />} title="Collaboration" description="Connect with all stakeholders in your supply chain through a single platform." />
            <FeatureCard icon={<Globe className="h-10 w-10 text-primary" />} title="Sustainability" description="Monitor and improve your environmental impact with detailed tracking." />
            <FeatureCard icon={<Lock className="h-10 w-10 text-primary" />} title="Security" description="Your data is protected with enterprise-grade security and encryption." />
            <FeatureCard icon={<CheckCircle className="h-10 w-10 text-primary" />} title="Compliance" description="Ensure compliance with industry standards and regulations." />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-2 lg:order-1">
              <Image src="/benefits.jpg" alt="Supply Chain Benefits" fill className="object-cover" />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
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
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Supply Chain?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Join the future of textile supply chain management with our decentralized platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90 border-white">
              Register Now
            </Button>
            <Button size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image src="/logo.svg" alt="logo" width={100} height={30} className="brightness-0" />
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Decentralized Textile Supply Chain. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

// Benefit Item Component
const BenefitItem = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex gap-3">
      <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default Page
