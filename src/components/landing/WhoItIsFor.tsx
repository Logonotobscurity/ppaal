import { motion } from 'framer-motion';
import { Users, TrendingUp, ShieldCheck, Globe } from 'lucide-react';

/**
 * @component WhoItIsFor
 * @description Landing page section targeting specific user personas
 * @pattern Component Pattern
 */
export function WhoItIsFor() {
  const personas = [
    {
      icon: Users,
      title: 'African SME Founders',
      description: 'Manage your business hands-free while in the market, on the go, or meeting clients. Speak Pidgin, Yorùbá, Igbo, or Hausa — PAL understands.',
      features: ['Voice-first workflow management', 'Automatic customer follow-ups', 'Payment collection automation'],
    },
    {
      icon: TrendingUp,
      title: 'Sales Teams & Field Agents',
      description: 'Close deals faster with instant CRM updates, automated proposals, and real-time approval workflows from anywhere.',
      features: ['On-the-spot invoice generation', 'Instant credit checks via memory', 'Team coordination via WhatsApp'],
    },
    {
      icon: ShieldCheck,
      title: 'Finance & Operations Managers',
      description: 'Maintain control with risk-gated approvals, audit trails, and benchmark intelligence across all business units.',
      features: ['Gs Gate risk scoring', 'Complete audit logs', 'Collections ladder automation'],
    },
    {
      icon: Globe,
      title: 'Multi-Location Enterprises',
      description: 'Scale operations across regions with tenant-isolated workspaces, centralized intelligence, and localized language support.',
      features: ['Workspace isolation', 'Cross-regional benchmarks', 'Code-switched language support'],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#16151A] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Built for African Commerce
          </h2>
          <p className="text-xl text-[#16151A]/70">
            From market traders to enterprise teams, PAL adapts to your workflow, language, and scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 bg-[#FAF7F2] rounded-3xl border border-[#16151A]/5 hover:border-[#6C3DF4]/20 transition-all"
            >
              <div className="w-14 h-14 mb-6 bg-[#6C3DF4]/10 rounded-2xl flex items-center justify-center">
                <persona.icon className="w-7 h-7 text-[#6C3DF4]" />
              </div>
              <h3 className="text-2xl font-bold text-[#16151A] mb-4">{persona.title}</h3>
              <p className="text-[#16151A]/70 mb-6 leading-relaxed">{persona.description}</p>
              <ul className="space-y-3">
                {persona.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[#16151A]/80">
                    <div className="w-1.5 h-1.5 bg-[#2E8B8B] rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
