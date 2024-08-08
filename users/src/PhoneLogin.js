import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import OtpInput from "otp-input-react";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";

const PhoneLogin = () => {
    const [otp, setOtp] = useState("");
    const [ph, setPh] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [user, setUser] = useState(null);


    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: (response) => {
                        onSignup();
                    },
                    "expired-callback": () => {
                        toast.error("Recaptcha expired, please try again.");
                    },
                },
                auth
            );
        }
    };

    const onSignup = () => {
        setLoading(true);
        setupRecaptcha();

        const appVerifier = window.recaptchaVerifier;
        const phoneNumber = "+" + ph;

        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setLoading(false);
                setShowOTP(true);
                toast.success("OTP sent successfully!");
            })
            .catch((error) => {
                console.error("Error during signInWithPhoneNumber:", error);
                if (error.code === 'auth/too-many-requests') {
                    toast.error("Too many attempts. Please try again later.");
                } else if (error.code === 'auth/invalid-phone-number') {
                    toast.error("Invalid phone number. Please enter a valid number.");
                } else if (error.code === 'auth/captcha-check-failed') {
                    toast.error("Captcha check failed. Please refresh the page and try again.");
                } else {
                    toast.error("Failed to send OTP. Please try again.");
                }
                setLoading(false);
            });
    };

    const onOTPVerify = () => {
        setLoading(true);
        window.confirmationResult
            .confirm(otp)
            .then((result) => {
                setUser(result.user);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error during OTP verification:", error);
                toast.error("Invalid OTP. Please try again.");
                setLoading(false);
            });
    };
    //verification
    return (
        <section className="flex items-center justify-center h-screen bg-emerald-500">
            <div>
                <Toaster toastOptions={{ duration: 4000 }} />
                <div id="recaptcha-container"></div>
                {user ? (
                    <h2 className="text-2xl font-medium text-center text-white">
                        👍 Login Success
                    </h2>
                ) : (
                    <div className="flex flex-col gap-4 p-4 rounded-lg w-80">

                        {showOTP ? (
                            <>
                                <div className="p-4 mx-auto bg-white rounded-full text-emerald-500 w-fit">
                                    <BsFillShieldLockFill size={30} />
                                </div>
                                <label
                                    htmlFor="otp"
                                    className="text-xl font-bold text-center text-white"
                                >
                                    Enter your OTP
                                </label>
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    OTPLength={6}
                                    otpType="number"
                                    disabled={false}
                                    autoFocus
                                    className="opt-container"
                                ></OtpInput>
                                <button
                                    onClick={onOTPVerify}
                                    className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                                >
                                    {loading && (
                                        <CgSpinner size={20} className="mt-1 animate-spin" />
                                    )}
                                    <span>Verify OTP</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="p-4 mx-auto bg-white rounded-full text-emerald-500 w-fit">
                                    <BsTelephoneFill size={30} />
                                </div>
                                <label
                                    htmlFor=""
                                    className="text-xl font-bold text-center text-white"
                                >
                                    Verify your phone number
                                </label>
                                <PhoneInput country={"in"} value={ph} onChange={setPh} />
                                <button
                                    onClick={onSignup}
                                    className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                                >
                                    {loading && (
                                        <CgSpinner size={20} className="mt-1 animate-spin" />
                                    )}
                                    <span>Send code via SMS</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PhoneLogin;
