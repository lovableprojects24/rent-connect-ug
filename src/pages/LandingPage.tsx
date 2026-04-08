import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  CreditCard,
  Users,
  Wrench,
  BarChart3,
  Shield,
  Bell,
  Smartphone,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-[#2d8f4e]" />
          <span className="font-heading font-bold text-xl text-foreground">
            Rent<span className="text-[#2d8f4e]">Flow</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-[#2d8f4e] hover:bg-[#24733f] text-white">
              Get Started Free
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-b border-border px-4 pb-4 space-y-3">
          <a href="#features" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#pricing" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#faq" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <Link to="/auth" className="block">
            <Button className="w-full bg-[#2d8f4e] hover:bg-[#24733f] text-white">Get Started Free</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-[#f0faf3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#2d8f4e] uppercase tracking-wider mb-3">
              Property Management Software
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-tight text-foreground">
              The all-in-one platform that scales with your{" "}
              <span className="text-[#2d8f4e]">portfolio</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-muted-foreground max-w-lg">
              Built for Uganda's landlords and property managers. Track properties, collect rent via mobile money, manage tenants and maintenance — all in one place.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-[#2d8f4e] hover:bg-[#24733f] text-white px-8 text-base h-12 rounded-lg">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="px-8 text-base h-12 rounded-lg border-[#2d8f4e] text-[#2d8f4e] hover:bg-[#f0faf3]">
                  See Features
                </Button>
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-6 flex-wrap">
              {["100+ Properties", "MTN MoMo & Airtel", "Free Forever Plan"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#2d8f4e]" /> {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-white">
              <img
                src="/screenshots/dashboard.png"
                alt="RentFlow Dashboard showing property overview and revenue charts"
                className="w-full"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#2d8f4e]/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#d4a843]/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const stats = [
    { value: "500+", label: "Landlords Trust Us" },
    { value: "3,000+", label: "Units Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section className="py-12 border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-heading font-bold text-[#2d8f4e]">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: CreditCard,
    title: "Collect payments, effortlessly",
    description:
      "Accept rent via MTN Mobile Money, Airtel Money, bank transfer, or cash. Auto-track who's paid and who hasn't with real-time status updates.",
    bullets: [
      "Mobile money integration (MTN & Airtel)",
      "Auto-generated payment receipts",
      "Real-time collection rate tracking",
    ],
    image: "/screenshots/payments.png",
    alt: "RentFlow payments page showing collection tracking",
  },
  {
    icon: Users,
    title: "Find the right renters, faster",
    description:
      "Manage your entire tenant lifecycle — from application to lease to move-out. Keep detailed records with emergency contacts and communication history.",
    bullets: [
      "Digital tenant profiles & records",
      "Lease management with auto-renewal alerts",
      "Tenant portal for self-service",
    ],
    image: "/screenshots/tenants.png",
    alt: "RentFlow tenants management page",
  },
  {
    icon: BarChart3,
    title: "Take full control of your accounting",
    description:
      "See your revenue at a glance with beautiful dashboards. Track occupancy rates, pending payments, and financial performance across all properties.",
    bullets: [
      "Revenue overview charts",
      "Property-level financial breakdowns",
      "Export reports to CSV",
    ],
    image: "/screenshots/dashboard.png",
    alt: "RentFlow dashboard with revenue charts",
  },
  {
    icon: Wrench,
    title: "Resolve maintenance in less time",
    description:
      "Tenants submit requests from their portal. Track priority, assign staff, and resolve issues — all with full audit trails.",
    bullets: [
      "Tenant self-service request submission",
      "Priority-based tracking (low to urgent)",
      "Staff assignment and resolution workflow",
    ],
    image: "/screenshots/maintenance.png",
    alt: "RentFlow maintenance tracking page",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Our Features
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage properties like a pro — designed for Uganda's market.
          </p>
        </motion.div>

        <div className="space-y-24">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
              style={{ direction: i % 2 === 1 ? "rtl" : "ltr" }}
            >
              <div style={{ direction: "ltr" }}>
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2d8f4e]/10 flex items-center justify-center">
                    <feat.icon className="w-5 h-5 text-[#2d8f4e]" />
                  </div>
                  <span className="text-xs font-semibold text-[#2d8f4e] uppercase tracking-wider">
                    {feat.icon === CreditCard ? "Payments" : feat.icon === Users ? "Tenant Screening" : feat.icon === BarChart3 ? "Accounting" : "Maintenance"}
                  </span>
                </motion.div>
                <motion.h3 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  {feat.title}
                </motion.h3>
                <motion.p variants={fadeUp} className="mt-3 text-muted-foreground leading-relaxed">
                  {feat.description}
                </motion.p>
                <motion.ul variants={fadeUp} className="mt-5 space-y-2">
                  {feat.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-[#2d8f4e] mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="mt-6">
                  <a href="#features" className="inline-flex items-center text-sm font-medium text-[#2d8f4e] hover:underline">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </motion.div>
              </div>
              <motion.div variants={fadeUp} style={{ direction: "ltr" }}>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-border bg-white">
                  <img
                    src={feat.image}
                    alt={feat.alt}
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformFeatures() {
  const items = [
    {
      icon: Building2,
      title: "Property Manager",
      description: "Manage multiple properties with dedicated dashboards and real-time occupancy tracking.",
    },
    {
      icon: Smartphone,
      title: "Mobile First Design",
      description: "Access everything from your phone. Installable as a PWA for offline-ready management.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control for landlords, managers, and tenants.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated rent reminders, late payment alerts, and lease expiry notifications.",
    },
  ];

  return (
    <section className="py-20 bg-[#f8faf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Plus, everything else you'd expect
          </h2>
          <p className="mt-2 text-muted-foreground">on our highly rated platform</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-[#2d8f4e]/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[#2d8f4e]" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: "1", title: "Sign Up", description: "Create your free account in under 2 minutes. No credit card required." },
    { step: "2", title: "Add Properties", description: "Add your properties, units, and set rent amounts through our guided onboarding." },
    { step: "3", title: "Add Tenants", description: "Register tenants with their details. They get their own portal automatically." },
    { step: "4", title: "Collect Rent", description: "Tenants pay via mobile money or bank transfer. Track everything in real-time." },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Get started in 4 simple steps
          </h2>
          <p className="mt-3 text-muted-foreground">From sign-up to collecting rent — in minutes, not days.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((s) => (
            <motion.div key={s.step} variants={fadeUp} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#2d8f4e] text-white flex items-center justify-center font-heading text-xl font-bold mb-4">
                {s.step}
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function UserTypes() {
  const types = [
    {
      title: "Landlords",
      description: "Full visibility into your portfolio. Track revenue, occupancy, and manage everything from one dashboard.",
      cta: "Learn more",
    },
    {
      title: "Property Managers",
      description: "Dedicated manager portal with assigned properties, maintenance workflows, and tenant oversight.",
      cta: "Learn more",
    },
    {
      title: "Tenants",
      description: "Self-service portal to pay rent, submit maintenance requests, and view lease details.",
      cta: "Learn more",
    },
    {
      title: "Finance Teams",
      description: "Comprehensive financial reports with payment tracking and revenue analytics.",
      cta: "Learn more",
    },
  ];

  return (
    <section className="py-20 bg-[#f8faf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            A solution that scales with your needs
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {types.map((t) => (
            <motion.div
              key={t.title}
              variants={fadeUp}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-[#2d8f4e]/5 to-[#d4a843]/5 flex items-center justify-center">
                <Users className="w-12 h-12 text-[#2d8f4e]/40" />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.description}</p>
                <a href="#features" className="mt-3 inline-flex items-center text-sm font-medium text-[#2d8f4e] hover:underline">
                  {t.cta} <ChevronRight className="w-3 h-3 ml-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for landlords getting started",
      features: ["Up to 10 units", "Tenant management", "Payment tracking", "Basic reports", "Email support"],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "UGX 150,000",
      period: "/month",
      description: "For growing property portfolios",
      features: [
        "Up to 100 units",
        "Everything in Starter",
        "Mobile money integration",
        "Automated reminders",
        "Manager accounts",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale property management",
      features: [
        "Unlimited units",
        "Everything in Professional",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "On-site training",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need to.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[#2d8f4e] shadow-lg shadow-[#2d8f4e]/10 relative"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2d8f4e] text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-heading font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-[#2d8f4e] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-8">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-[#2d8f4e] hover:bg-[#24733f] text-white"
                      : "bg-white border border-[#2d8f4e] text-[#2d8f4e] hover:bg-[#f0faf3]"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What is property management software?",
      a: "Property management software helps landlords and managers organize their rental properties, track payments, manage tenants, handle maintenance, and generate financial reports — all from one platform.",
    },
    {
      q: "Why do you need property management software?",
      a: "Manual tracking with spreadsheets leads to missed payments, lost records, and poor tenant communication. RentFlow automates these tasks so you can focus on growing your portfolio.",
    },
    {
      q: "Can tenants pay via mobile money?",
      a: "Yes! RentFlow integrates with MTN Mobile Money and Airtel Money, the most popular payment methods in Uganda. Tenants can also pay via bank transfer or cash.",
    },
    {
      q: "What features should you look for in property management software?",
      a: "Key features include payment tracking, tenant management, maintenance request handling, financial reports, mobile access, and role-based access for your team.",
    },
    {
      q: "Is RentFlow free to use?",
      a: "Yes, our Starter plan is free forever for up to 10 units. For larger portfolios, our Professional plan starts at UGX 150,000/month with a free trial.",
    },
    {
      q: "How much does property management software cost?",
      a: "RentFlow starts free for small landlords. Our Professional plan is UGX 150,000/month and Enterprise pricing is custom-based on your needs.",
    },
    {
      q: "What makes RentFlow different from other solutions?",
      a: "RentFlow is built specifically for Uganda's market with mobile money integration, UGX currency support, and a mobile-first design that works on any device.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#f8faf9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            FAQs
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-20 bg-[#2d8f4e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold text-white">
            List, manage, and maintain your properties at scale.{" "}
            <span className="italic text-[#d4a843]">Effortlessly.</span>
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-8">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-[#2d8f4e] hover:bg-gray-100 px-10 text-base h-12 rounded-lg font-semibold">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-white/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-[#2d8f4e]" />
              <span className="font-heading font-bold text-lg text-white">
                Rent<span className="text-[#2d8f4e]">Flow</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Uganda's smartest tenant management system. Track properties, collect rent via mobile money, and manage tenants.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Kampala, Uganda</li>
              <li>info@rentflow.ug</li>
              <li>+256 703 911851</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} RentFlow. All rights reserved.</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#d4a843] text-[#d4a843]" />
            ))}
            <span className="ml-2 text-sm text-white/50">Trusted by landlords across Uganda</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Features />
      <PlatformFeatures />
      <HowItWorks />
      <UserTypes />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
