import { motion } from 'framer-motion';
import { Smartphone, Wifi, Zap, Shield } from 'lucide-react';

/**
 * @component MobileFeatures
 * @description Landing page section highlighting mobile-first capabilities
 * @pattern Component Pattern
 */
export function MobileFeatures() {
  const features = [
    {
      icon: Smartphone,
      title: 'Touch-Optimized UI',
      description: 'Bottom tab navigation, swipeable workflow cards, and large touch targets designed for one-handed market use.',
    },
    {
      icon: Wifi,
      title: 'Offline-First PWA',
      description: 'Voice sessions queue locally when connectivity drops. Auto-syncs when back online. Works on slow 3G networks.',
    },
    {
      icon: Zap,
      title: 'Instant-On Edge Layer',
      description: 'Lock-screen widgets, floating action buttons, and ambient modes for hands-free operation while walking or driving.',
    },
    {
      icon: Shield,
      title: 'Pocket & Meeting Modes',
      description: 'Voice-only interaction with haptic feedback. Discreet notifications that respect your current context.',
    },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-[#16151A] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Built for Mobile<br />
              <span className="text-[#6C3DF4]">Field Operations</span>
            </h2>
            <p className="text-xl text-[#16151A]/70 mb-8 leading-relaxed">
              PAL isn't just responsive — it's designed from the ground up for African market traders, field agents, and founders on the move.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#FAF7F2] rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#6C3DF4]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#16151A] mb-1">{feature.title}</h3>
                    <p className="text-[#16151A]/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 px-8 py-4 bg-[#16151A] text-white font-semibold rounded-2xl hover:bg-[#16151A]/90 transition-all shadow-lg"
            >
              Try Mobile Demo
            </motion.button>
          </div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative hidden md:block"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto w-[320px] h-[640px] bg-[#16151A] rounded-[48px] p-3 shadow-2xl">
              {/* Screen */}
              <div className="w-full h-full bg-[#FAF7F2] rounded-[40px] overflow-hidden relative">
                {/* Status Bar */}
                <div className="h-8 bg-[#16151A]/5 flex items-center justify-between px-6">
                  <span className="text-xs text-[#16151A]/60">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2.5 bg-[#16151A]/20 rounded-sm" />
                    <div className="w-4 h-2.5 bg-[#16151A]/20 rounded-sm" />
                  </div>
                </div>

                {/* App Header */}
                <div className="px-4 py-3 border-b border-[#16151A]/5">
                  <h3 className="font-semibold text-[#16151A]">Dashboard</h3>
                </div>

                {/* Workflow Card */}
                <div className="p-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#16151A]/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#6C3DF4]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#6C3DF4] font-bold text-sm">M</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#16151A]">Musa - Payment</p>
                        <p className="text-xs text-[#16151A]/50">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#16151A]">₦50,000</span>
                      <span className="px-3 py-1 bg-[#2E8B8B]/10 text-[#2E8B8B] text-xs font-medium rounded-full">
                        Approved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Tab Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#16151A]/5 flex items-center justify-around px-4 pb-2">
                  <TabIcon active />
                  <TabIcon />
                  <TabIcon />
                  <TabIcon />
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#6C3DF4]/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#2E8B8B]/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface TabIconProps {
  active?: boolean;
}

function TabIcon({ active }: TabIconProps) {
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      active ? 'bg-[#6C3DF4] text-white' : 'text-[#16151A]/40'
    }`}>
      <div className="w-5 h-5 bg-current rounded" />
    </div>
  );
}
