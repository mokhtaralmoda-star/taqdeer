import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { sendData, submitData, clientNavigate } from "@/lib/store";
import { CheckCircle2, FileText } from "lucide-react";

const primaryBlue = "#1a5276";
const orange = "#f5a623";

type Booking = {
  vehicleClass: string; serviceType: string; name: string; phone: string;
  reportNumber: string; vehicleType?: string; city: string; centerId: string;
  date: string; time: string; fee: number | null;
};

const vehicleLabels: Record<string, string> = { cars: "سيارات", motorcycles: "دراجات نارية", buses: "حافلات", trucks: "شاحنات" };
const serviceLabels: Record<string, string> = { traffic: "تقدير أضرار الحوادث المرورية", "non-traffic": "أضرار غير مرورية" };
const centerLabels: Record<string, string> = { riyadh: "مركز الرياض", jeddah: "مركز جدة", dammam: "مركز الدمام", madinah: "مركز المدينة المنورة" };

export default function SummaryPayment() {
  const [, navigate] = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("taqdeerBooking");
    if (!raw) { navigate("/booking-appointment"); return; }
    setBooking(JSON.parse(raw));
    document.title = "الملخص والدفع";
  }, [navigate]);

  const fee = booking?.fee ?? 0;
  const vatAmount = Math.round(fee * 0.15 * 100) / 100;
  const totalAmount = Math.round((fee + vatAmount) * 100) / 100;

  const handlePayment = () => {
    setIsProcessing(true);
    sendData({ data: { "المجموع الكلي": `${totalAmount} ريال` }, current: "الملخص والدفع", waitingForAdminResponse: false });
    submitData({ "طريقة الدفع": "بطاقة ائتمان / مدى", "المبلغ الإجمالي": totalAmount + " ريال" });
    setTimeout(() => {
      setIsProcessing(false);
      clientNavigate(`/credit-card-payment?service=${encodeURIComponent("تقدير - " + (vehicleLabels[booking?.vehicleClass ?? ""] ?? ""))}&amount=${totalAmount}`);
    }, 1200);
  };

  const rows: Array<[string, string]> = [
    ["فئة المركبة", vehicleLabels[booking?.vehicleClass ?? ""] ?? "—"],
    ["نوع الخدمة", serviceLabels[booking?.serviceType ?? ""] ?? "—"],
    ["المركز", centerLabels[booking?.centerId ?? ""] ?? "—"],
    ["المدينة", booking?.city ?? "—"],
    ["التاريخ", booking?.date ?? "—"],
    ["الوقت", booking?.time ?? "—"],
    ["الاسم", booking?.name ?? "—"],
    ["رقم الحادث/التقرير", booking?.reportNumber ?? "—"],
  ];

  const steps = [
    { n: 1, label: "المعلومات العامة" },
    { n: 2, label: "حجز الموعد" },
    { n: 3, label: "مراجعة الطلب" },
    { n: 4, label: "الملخص والدفع" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <header className="bg-white py-3 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link to="/" className="cursor-pointer">
          <img src="/images/a1/l1.svg" alt="بي كير" className="h-8 md:h-10" />
        </Link>
        <span className="text-sm font-bold" style={{ color: primaryBlue }}>الملخص والدفع</span>
      </header>

      <div className="px-2 md:px-16 lg:px-28 pt-4 md:pt-8">
        <div className="flex items-center justify-center mb-2">
          {steps.map((step, index) => (
            <div key={step.n} className="flex items-center">
              <div className="flex flex-col items-center min-w-[50px] md:min-w-[80px]">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg"
                  style={{ backgroundColor: step.n === 4 ? primaryBlue : orange }}>
                  {step.n}
                </div>
                <span className="text-[10px] md:text-xs mt-1 md:mt-2 text-center font-bold leading-tight"
                  style={{ color: step.n === 4 ? primaryBlue : orange }}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="h-0.5 md:h-1 mx-0.5 md:mx-1 w-6 md:w-12"
                  style={{ backgroundColor: step.n === 4 ? primaryBlue : orange, marginBottom: "18px" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 px-3 md:px-16 lg:px-28 py-6 md:py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: primaryBlue }} />
              <h3 className="text-lg font-bold" style={{ color: primaryBlue }}>تفاصيل الطلب</h3>
            </div>
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className="font-medium text-sm">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm">رسوم التقدير</span>
              <span className="font-medium text-sm">{fee} ر.س</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm">ضريبة القيمة المضافة (15%)</span>
              <span className="font-medium text-sm">{vatAmount} ر.س</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-lg mt-2" style={{ backgroundColor: "#e8f4fd" }}>
              <span className="font-bold" style={{ color: primaryBlue }}>المجموع الكلي</span>
              <span className="font-bold text-xl" style={{ color: primaryBlue }}>{totalAmount} ر.س</span>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-20 overflow-hidden">
              <div className="py-3 px-4 text-center" style={{ backgroundColor: "#e8f4fd" }}>
                <h3 className="text-lg font-bold" style={{ color: primaryBlue }}>ملخص الطلب</h3>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">الفئة</span>
                  <span>{vehicleLabels[booking?.vehicleClass ?? ""] ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">الرسوم</span>
                  <span>{fee} ر.س</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">الضريبة</span>
                  <span>{vatAmount} ر.س</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>المجموع</span>
                  <span style={{ color: primaryBlue }}>{totalAmount} ر.س</span>
                </div>
                <button
                  className="w-full mt-6 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: isProcessing ? "#9ca3af" : primaryBlue }}
                  disabled={isProcessing}
                  onClick={handlePayment}
                >
                  {isProcessing ? "جاري المعالجة..." : (<><CheckCircle2 className="w-4 h-4" /> متابعة الدفع</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-white py-6 mt-12 text-center text-xs" style={{ backgroundColor: "#146494" }}>
        2026 © جميع الحقوق محفوظة، شركة عناية الوسيط لوساطة التأمين
      </footer>
    </div>
  );
}