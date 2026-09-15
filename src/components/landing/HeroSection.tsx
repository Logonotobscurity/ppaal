import { motion } from 'framer-motion';
import { Mic, Brain, Shield, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * @component HeroSection
 * @description Landing page hero with animated pipeline visualization
 * @pattern Component Pattern
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF7F2]">
      {/* Background Gradient Orb */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#6C3DF4]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm border border-[#6C3DF4]/20 rounded-full"
          >
            <span className="w-2 h-2 bg-[#6C3DF4] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#16151A]/80">
              Voice-First AI OS for African Commerce
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-[#16151A] mb-6 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Your Voice is the Interface.<br />
            Your Business is the Output.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#16151A]/70 mb-12 max-w-3xl mx-auto"
          >
            "Better speech recognition only matters if the meaning survives
            into the downstream decision."
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <button className="group px-8 py-4 bg-[#6C3DF4] text-white font-semibold rounded-2xl hover:bg-[#6C3DF4]/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Start Speaking Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-[#16151A] font-semibold rounded-2xl border-2 border-[#16151A]/10 hover:border-[#6C3DF4]/30 transition-all">
              Watch Demo
            </button>
          </motion.div>

          {/* Pipeline Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            <PipelineStep
              icon={Mic}
              title="Speak Pidgin"
              description="Code-switched voice input"
              delay={0.6}
            />
            <PipelineStep
              icon={Brain}
              title="CME Parses"
              description="Cultural meaning extraction"
              delay={0.8}
            />
            <PipelineStep
              icon={Shield}
              title="Gs Gate Scores"
              description="Risk assessment & approval"
              delay={1.0}
            />
            <PipelineStep
              icon={CheckCircle}
              title="Action Taken"
              description="WhatsApp, payment, workflow"
              delay={1.2}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface PipelineStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

function PipelineStep({ icon: Icon, title, description, delay }: PipelineStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#16151A]/5"
    >
      <div className="w-16 h-16 mb-4 bg-[#6C3DF4]/10 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#6C3DF4]" />
      </div>
      <h3 className="text-lg font-semibold text-[#16151A] mb-2">{title}</h3>
      <p className="text-sm text-[#16151A]/60 text-center">{description}</p>
    </motion.div>
  );
}
