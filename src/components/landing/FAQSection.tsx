import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * @component FAQSection
 * @description Landing page FAQ with accordion functionality
 * @pattern Component Pattern
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does PAL understand Pidgin and code-switched speech?',
      answer: 'PAL uses the Sahara CodeSwitch API combined with our Cultural Meaning Engine (CME) trained on African languages. The CME detects negations, idioms, and cultural context in English, Pidgin, Yorùbá, Igbo, and Hausa — even when mixed in a single sentence.',
    },
    {
      question: 'What happens if the AI makes a mistake?',
      answer: 'Every action goes through the Gs Gate risk scoring system. High-risk actions (Gs ≥ 3.0) require human approval before execution. All decisions are logged in an immutable audit trail, and you can replay any session to understand what happened.',
    },
    {
      question: 'Is my business data secure?',
      answer: 'Yes. All data is stored in Supabase PostgreSQL with Row-Level Security (RLS) enforced on every table. Your workspace is completely isolated from other tenants. We never use your business data to train public models.',
    },
    {
      question: 'Can I use PAL offline?',
      answer: 'PAL is designed as a Progressive Web App (PWA). Basic features work offline, and voice sessions are queued locally when connectivity is lost. Once reconnected, sessions sync automatically to the cloud.',
    },
    {
      question: 'What external services does PAL integrate with?',
      answer: 'PAL integrates with WhatsApp Business API, Paystack, Flutterwave, MTN MoMo for payments, and productivity tools like Slack, Gmail, Shopify, and Stripe via OAuth. More integrations are added monthly.',
    },
    {
      question: 'How much does PAL cost?',
      answer: 'We offer a free tier for individual founders with up to 100 voice sessions/month. Pro plans start at ₦5,000/month for teams with unlimited sessions, advanced analytics, and priority support.',
    },
  ];

  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#16151A] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-[#16151A]/70">
            Everything you need to know about PAL's capabilities, security, and pricing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-[#16151A]/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF7F2]/50 transition-colors"
              >
                <span className="font-semibold text-[#16151A] pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#16151A]/50 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-[#16151A]/70 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-20 grid md:grid-cols-3 gap-8 text-center">
          <TrustBadge
            icon={CheckCircle}
            title="Bank-Level Security"
            description="Supabase RLS + Force RLS on all tables"
          />
          <TrustBadge
            icon={AlertCircle}
            title="Human-in-the-Loop"
            description="Gs Gate approval for high-risk actions"
          />
          <TrustBadge
            icon={CheckCircle}
            title="Audit Trail"
            description="Immutable logs for every workflow run"
          />
        </div>
      </div>
    </section>
  );
}

interface TrustBadgeProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function TrustBadge({ icon: Icon, title, description }: TrustBadgeProps) {
  return (
    <div className="p-6">
      <div className="w-12 h-12 mx-auto mb-4 bg-[#2E8B8B]/10 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#2E8B8B]" />
      </div>
      <h3 className="font-semibold text-[#16151A] mb-2">{title}</h3>
      <p className="text-sm text-[#16151A]/60">{description}</p>
    </div>
  );
}
