import {
  ShieldCheck,
  Check,
  Clock3,
  Rocket,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
 
const ApprovalPendingPage = ({ phone, email }) => {
  return (
    <div className=" w-full bg-gradient-to-br from-[#f8f9fc] via-[#f3f4f6] to-[#eef2ff] flex flex-col">
      {/* Top Hero Section */}
      <div className="bg-primary w-full px-4 md:px-16 py-4 md:py-18">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white w-10 h-10" />
              </div>
 
              <div>
                <p className="text-white/70 uppercase tracking-[0.25em] text-sm font-semibold">
                  Account Status
                </p>
 
                <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight">
                  Pending Approval
                </h1>
              </div>
            </div>
 
            <p className="text-white/80 px-6 md:px-12 lg:px-24 text-base md:text-md leading-relaxed max-w-2xl">
              Your account has been successfully created and is currently under
              verification by our administration team.
            </p>
          </div>
 
          {/* Right Status Steps */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 w-full md:w-[420px]">
            <div className="flex items-center justify-between">
              {/* Registered */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shadow">
                  <Check className="text-green-600 w-6 h-6" />
                </div>
 
                <span className="mt-3 text-sm text-white font-medium">
                  Registered
                </span>
              </div>
 
              <div className="flex-1 h-[2px] bg-yellow-300 mx-3" />
 
              {/* Review */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center shadow animate-pulse">
                  <Clock3 className="text-yellow-500 w-6 h-6" />
                </div>
 
                <span className="mt-3 text-sm text-yellow-200 font-semibold">
                  Review
                </span>
              </div>
 
              <div className="flex-1 h-[2px] bg-white/20 mx-3" />
 
              {/* Activated */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shadow">
                  <Rocket className="text-gray-400 w-6 h-6" />
                </div>
 
                <span className="mt-3 text-sm text-white/60 font-medium">
                  Activated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Main Content */}
      <div className="flex-1 w-full px-6 md:px-16 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Message Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verification In Progress
              </h2>
 
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Our team is currently reviewing your account information. Once
                approved, you'll gain complete access to all platform features
                and services.
              </p>
            </div>
 
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <Clock3 className="text-yellow-600 w-6 h-6" />
                </div>
 
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Approval Timeline
                  </h3>
 
                  <p className="text-yellow-700 leading-relaxed">
                    Approval usually takes less than 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Contact Section */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Need Assistance?
            </h2>
 
            <p className="text-gray-500 mb-8">
              Our support team is here to help you anytime.
            </p>
 
            <div className="space-y-5">
              {/* Phone */}
              <a
                href={`tel:${ 8866889580}`}
                className="group flex items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 p-5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Phone className="text-blue-600 w-6 h-6" />
                </div>
 
                <div>
                  <p className="text-sm text-gray-900">Phone Number</p>
 
                  <p className="text-lg font-semibold text-gray-800">
                    8866889580
                  </p>
                </div>
 
                <ArrowRight className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
              </a>
 
              {/* Email */}
              <a
                href={`mailto:$info.justcatering@gmail.com`}
                className="group flex items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 p-5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Mail className="text-blue-600 w-6 h-6" />
                </div>
 
                <div>
                  <p className="text-sm text-gray-900">Email Address</p>
 
                  <p className="text-md font-semibold text-gray-800 break-all">
                    info.justcatering@gmail.com
                  </p>
                </div>
 
                <ArrowRight className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ApprovalPendingPage;
 
 