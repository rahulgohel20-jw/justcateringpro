import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Calendar, DollarSign, Sparkles } from "lucide-react";

export default function PlanDetailSidebar({ isOpen, onClose, plan }) {
  if (!plan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-[650px] max-w-[95vw] bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ x: "110%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "110%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {/* Header with gradient */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-medium text-blue-100">Plan Details</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">
                      {plan.plan_name}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Complete plan information and features
                    </p>
                  </div>
                  <button
                    className="p-2.5 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Popular badge */}
                {(plan.isPopular === "Yes" || plan.isPopular === true) && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-4 right-16 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Star className="w-3 h-3 fill-current" />
                    POPULAR
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Price Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm font-medium">Pricing</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ₹{plan.price?.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm">/ {plan.billingCycle?.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">Billing</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {plan.billingCycle}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Description */}
                {plan.description && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {plan.description}
                    </p>
                  </motion.div>
                )}

                {/* Features */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Features Included
                  </h3>
                  {plan.features && plan.features.length > 0 ? (
                    <div className="space-y-3">
                      {plan.features.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="mt-0.5 p-1 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 leading-relaxed flex-1">
                            {typeof f === "object" ? f.featureText : f}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-center py-4">
                      No features listed
                    </p>
                  )}
                </motion.div>

                {/* Action Button */}
               
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Demo wrapper to show the component
function Demo() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const samplePlan = {
    plan_name: "Professional Plan",
    price: 2499,
    billingCycle: "Monthly",
    isPopular: true,
    description: "Perfect for growing businesses that need advanced features and priority support. Get access to all premium tools and unlimited team members.",
    features: [
      "Unlimited projects and workspaces",
      "Advanced analytics and reporting",
      "Priority 24/7 customer support",
      "Custom branding and white-label",
      "API access and integrations",
      "Advanced security features",
      "Dedicated account manager",
      "99.9% uptime SLA guarantee"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        View Plan Details
      </button>
      
      <PlanDetailSidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        plan={samplePlan}
      />
    </div>
  );
}