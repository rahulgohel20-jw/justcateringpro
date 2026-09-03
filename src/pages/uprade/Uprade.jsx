import { Check } from "lucide-react";
import { Fragment } from "react";
import { Container } from "@/components/container";


const plans = [
  {
    id: "account",
    name: "Account",
    tagline: "For Individual Caterers",
    price: "₹10,000",
    period: "Per month",
    description:
      "Essential tools to manage your clients and track event logistics with ease.",
    features: [
      "Up to 5 Monthly Events",
      "Basic CRM Integration",
      "Digital Invoicing",
    ],
    btnLabel: "Get Started",
    featured: false,
  },
  {
    id: "stock",
    name: "Stock",
    tagline: "For growing professional teams",
    price: "₹18,000",
    period: "Per month",
    description:
      "Advanced Inventory control and automated staffing for high volume operations.",
    features: [
      "Unlimited Event Tracking",
      "Real-time Inventory Sync",
      "Staff Performance Analytics",
    ],
    btnLabel: "Upgrade to Stock",
    featured: true,
  },
  {
    id: "recipe",
    name: "Recipe",
    tagline: "For culinary innovation labs",
    price: "₹6,000",
    period: "Per month",
    description:
      "Full recipe costing and end-to-end supply chain management for innovative kitchens.",
    features: [
      "Recipe Costing Engine",
      "Supplier API Access",
      "Menu Profitability Reports",
    ],
    btnLabel: "Select Recipe",
    featured: false,
  },
];

export default function Upgrade() {
  return (
    <Fragment >

      <Container>
      

      <div className="w-full  ">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3 ">
            Elevate Your{" "}
            <span className="text-primary">Culinary Operations</span>
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Choose a plan designed for precision. From boutique caterers to
            <br className="hidden sm:block" />
            industrial kitchens, JCx scales with your ambition.
          </p>
        </div>

        {/* ── Plans Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center px-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-7 flex flex-col gap-4 relative transition-transform
                ${plan.featured
                  ? "bg-primary shadow-2xl scale-105 z-10"
                  : "bg-white border border-gray-200 shadow-md"
                }`}
            >
              {/* Plan Name + Tagline */}
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    plan.featured ? "text-white" : "text-gray-800"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    plan.featured ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {plan.tagline}
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span
                    className={`text-4xl font-bold ${
                      plan.featured ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-xs ${
                      plan.featured ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p
                className={`text-xs leading-relaxed ${
                  plan.featured ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {plan.description}
              </p>

              {/* Divider */}
              <div
                className={`border-t ${
                  plan.featured ? "border-blue-400/40" : "border-gray-100"
                }`}
              />

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.featured ? "bg-white/20" : "bg-blue-50"
                      }`}
                    >
                      <Check
                        size={10}
                        strokeWidth={3}
                        className={
                          plan.featured ? "text-white" : "text-primary"
                        }
                      />
                    </span>
                    <span
                      className={`text-xs ${
                        plan.featured ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`mt-2 w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-white text-primary hover:bg-blue-50"
                    : "border border-primary text-primary hover:bg-blue-50"
                }`}
              >
                {plan.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      </Container>


    </Fragment>
  );
}