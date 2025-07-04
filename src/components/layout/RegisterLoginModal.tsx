import { useState } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import InputField from "../form/InputField";
import Button from "../form/Button";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

export default function RegisterLoginModal({
  isOpen,
  onClose,
  mode,
  setMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "register" | "login";
  setMode: (mode: "register" | "login") => void;
}) {
  const { login, register, loading, error } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const canSubmit =
    mode === "login"
      ? email.trim() !== "" && password.trim() !== ""
      : username.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        agreeTerms;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("handleSubmit", mode, username, email, password, agreeTerms);
    try {
      if (mode === "register") {
        await register(username, email, password, agreeTerms, referralCode);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-[var(--color-popup-background)]"
        aria-hidden="true"
      />
      <Dialog.Panel className="relative bg-black rounded-2xl flex w-full max-w-5xl mx-auto overflow-hidden text-white">
        {/* Left Section */}
        <div className="hidden lg:flex w-1/2 relative">
          <Image
            src="/images/Frame-3.svg"
            alt="Register/Login Graphic"
            fill
            className="object-cover"
          />

          <svg
            className="absolute top-[42px] left-1/2 -translate-x-1/2"
            width="175"
            height="32"
            viewBox="0 0 175 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.8792 31.3005H4.13329L0 0.699452H9.00623L10.442 21.0273L19.0132 0.699452H28.7155L13.8792 31.3005Z"
              fill="white"
            />
            <path
              d="M24.2189 31.3005L29.5704 0.699452H38.2721L32.9205 31.3005H24.2189Z"
              fill="white"
            />
            <path
              d="M47.3235 32C44.0749 32 41.4209 31.3443 39.3615 30.0328C37.3311 28.6922 35.9533 26.7832 35.2282 24.306L42.7551 20.4153C43.6833 22.7468 45.4526 23.9126 48.0631 23.9126C50.1225 23.9126 51.2538 23.3734 51.4568 22.2951C51.5728 21.5956 51.2102 21.0565 50.3691 20.6776C49.905 20.4444 49.4989 20.2696 49.1508 20.153C48.7738 20.0073 47.7151 19.6721 45.9747 19.1475C40.5797 17.2823 38.3028 13.9308 39.1439 9.0929C39.608 6.38251 40.9423 4.18215 43.1467 2.4918C45.3221 0.830601 47.9761 0 51.1087 0C53.7192 0 55.9527 0.612022 57.809 1.83607C59.6654 3.06011 61.0721 4.82331 62.0293 7.12568L54.6764 11.0601C53.9223 9.07832 52.5445 8.08743 50.5431 8.08743C49.0058 8.08743 48.1357 8.61202 47.9326 9.6612C47.7876 10.3315 48.0486 10.8561 48.7158 11.235C49.4699 11.7013 50.7752 12.2404 52.6315 12.8525C55.039 13.6685 56.9098 14.674 58.2441 15.8689C59.9844 17.4135 60.5935 19.7887 60.0714 22.9945C59.5494 25.9381 58.1861 28.1821 55.9817 29.7268C53.7772 31.2423 50.8912 32 47.3235 32Z"
              fill="white"
            />
            <path
              d="M87.3536 31.3005H78.2603L77.9123 27.3661H69.1236L67.3832 31.3005H57.7679L72.8218 0.699452H83.0027L87.3536 31.3005ZM76.3895 10.9727L72.2127 20.3716H77.2596L76.3895 10.9727Z"
              fill="white"
            />
            <path
              d="M114.597 9.74863C114.075 12.4007 112.697 14.4117 110.463 15.7814C112.755 17.3843 113.668 19.7013 113.204 22.7322C112.827 25.326 111.551 27.4098 109.376 28.9836C107.229 30.5282 104.474 31.3005 101.109 31.3005H88.2305L93.5821 0.699452H105.242C108.549 0.699452 111.058 1.5592 112.769 3.27869C114.452 4.96903 115.061 7.12568 114.597 9.74863ZM103.85 8.21858H100.978L100.239 12.3279L103.589 12.2842C104.865 12.1093 105.605 11.439 105.808 10.2732C105.924 9.57377 105.793 9.06375 105.416 8.74317C105.039 8.39344 104.517 8.21858 103.85 8.21858ZM104.72 21.5956C104.923 20.3424 104.43 19.6284 103.241 19.4536L99.0206 19.4098L98.2375 23.7814H101.892C102.617 23.7814 103.226 23.592 103.72 23.2131C104.242 22.8051 104.575 22.2659 104.72 21.5956Z"
              fill="#4264FF"
            />
            <path
              d="M138.851 0.699452L137.459 8.65574H126.364L125.799 11.9781H135.806L134.413 19.847H124.406L123.797 23.2568H135.109L133.717 31.3005H113.703L119.055 0.699452H138.851Z"
              fill="#4264FF"
            />
            <path
              d="M139.941 0.699452H163L161.521 9.18033H154.342L150.47 31.3005H141.768L145.64 9.18033H138.461L139.941 0.699452Z"
              fill="#4264FF"
            />
            <path
              d="M170 4.80001V1.20001H171.25L172.5 2.40001L173.75 1.20001H175V4.80001H173.75V2.40001L172.5 3.60001L171.25 2.40001V4.80001M166.25 4.80001V2.40001H165V1.20001H168.75V2.40001H167.5V4.80001"
              fill="#4264FF"
            />
          </svg>

          <p className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-[10px] text-center text-white max-w-3xs">
            By accessing the site, I attest that I am at least 18 years old and
            have read the Terms and Conditions
          </p>
        </div>

        {/* Right Section */}
        <div className="w-full bg-[var(--color-black)] lg:w-1/2 p-6 sm:p-10 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 relative w-full">
              <Button
                type="button"
                btntype="nav"
                onClick={() => setMode("register")}
                className={clsx(
                  "flex-1 text-sm font-medium pb-[20px]",
                  mode !== "register" && "text-[var(--color-muted)]"
                )}
                label="Register"
              />
              <Button
                type="button"
                btntype="nav"
                onClick={() => setMode("login")}
                className={clsx(
                  "flex-1 text-sm font-medium pb-[20px]",
                  mode !== "login" && "text-[var(--color-muted)]"
                )}
                label="Login"
              />
              <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--surface-l3)] w-full transition-all duration-300">
                <div
                  className={`h-full bg-[var(--color-brand)] transition-all duration-300 ${
                    mode === "register" ? "w-1/2 left-0" : "w-1/2 left-1/2"
                  }`}
                  style={{ position: "absolute" }}
                />
              </div>
            </div>
            <Button
              type="button"
              btntype="nav"
              onClick={onClose}
              className="text-white/50 hover:text-white absolute right-0 top-0 !p-3"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 18L18 6M6 6L18 18"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-[40px] space-y-6">
            {mode === "register" && (
              <InputField
                label="Username*"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-blue-500"
              />
            )}
            <InputField
              label="Email*"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Password*"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === "register" && (
              <div className="flex items-center gap-3 cursor-pointer transition-all duration-300">
                <input
                  type="checkbox"
                  id="terms"
                  className="accent-[#626273] w-4 h-4 border border-[var(--surface-l3)] rounded-lg focus:ring-0 focus:outline-none"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-[100%]"
                >
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
            )}

            {mode === "register" && (
              <details className="border-y border-[var(--surface-l3)] py-4 my-4 mb-[40px]">
                <summary className="cursor-pointer list-none flex items-center gap-2 justify-between">
                  <span className="text-sm font-medium leading-[100%]">
                    Referral Code (Optional)
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M15.8333 7.5L9.99996 13.3333L4.16663 7.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <InputField
                  type="text"
                  placeholder="Enter code"
                  className="mt-2"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  noLabel
                />
              </details>
            )}
            {error && (
              <p className="text-[var(--color-error)] text-sm">{error}</p>
            )}
            <Button
              type="submit"
              className={clsx(
                "w-full",
                !canSubmit &&
                  "opacity-40 pointer-events-none bg-[var(--color-blue)]"
              )}
              label={
                loading
                  ? "Loading..."
                  : mode === "register"
                  ? "Register"
                  : "Login"
              }
              disabled={loading}
            />

            <div className="text-center text-sm font-medium leading-[100%] text-white">
              Or continue with
            </div>
            <div className="flex justify-between gap-4 mb-8">
              <Button
                type="button"
                btntype="nav"
                className="text-sm font-medium leading-[100%] cursor-pointer flex-1 bg-[var(--button-background-primary-default)] text-white py-[10px] rounded-full flex justify-center items-center gap-[6px]"
                label="Google"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                  >
                    <path
                      d="M12.6442 11.1V13.8333H19.1775C18.9775 15.3667 18.4667 16.4892 17.6883 17.2775C16.7325 18.2333 15.2442 19.2775 12.6442 19.2775C8.62167 19.2775 5.4775 16.0333 5.4775 12.0108C5.4775 7.98833 8.62167 4.74417 12.6442 4.74417C14.8108 4.74417 16.4 5.6 17.5667 6.7L19.4892 4.7775C17.8667 3.2 15.6883 2 12.6442 2C7.13333 2 2.5 6.48917 2.5 12C2.5 17.5108 7.13333 22 12.6442 22C15.6217 22 17.8667 21.0225 19.6217 19.2C21.4217 17.4 21.9883 14.8558 21.9883 12.8108C21.9883 12.1775 21.9442 11.5883 21.8442 11.1H12.6442Z"
                      fill="white"
                    />
                  </svg>
                }
              />
              {/* <Button
                type="button"
                btntype="nav"
                className="font-medium text-xs cursor-pointer flex-1 bg-[var(--button-background-primary-default)] text-white py-4 rounded-md flex justify-center items-center gap-[6px]"
                label="Line"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M18.1375 9.7425C18.4283 9.7425 18.6625 9.98 18.6625 10.2683C18.6625 10.5558 18.4283 10.7933 18.1375 10.7933H16.675V11.7308H18.1375C18.4283 11.7308 18.6625 11.9667 18.6625 12.2558C18.6625 12.5425 18.4283 12.78 18.1375 12.78H16.1492C15.8617 12.78 15.6267 12.5425 15.6267 12.2558V8.28C15.6267 7.9925 15.8617 7.755 16.1517 7.755H18.14C18.4283 7.755 18.6625 7.9925 18.6625 8.28C18.6625 8.57083 18.4283 8.805 18.1375 8.805H16.675V9.7425H18.1375ZM14.925 12.2558C14.925 12.4808 14.78 12.6808 14.565 12.7525C14.5117 12.77 14.4542 12.7783 14.3992 12.7783C14.2233 12.7783 14.0733 12.7033 13.9742 12.57L11.9383 9.80583V12.2558C11.9383 12.5425 11.7058 12.78 11.4125 12.78C11.1242 12.78 10.8908 12.5425 10.8908 12.2558V8.28C10.8908 8.055 11.035 7.855 11.2492 7.78417C11.2992 7.765 11.3625 7.75667 11.4108 7.75667C11.5733 7.75667 11.7233 7.84333 11.8233 7.96833L13.875 10.7433V8.28C13.875 7.9925 14.11 7.755 14.4 7.755C14.6875 7.755 14.925 7.9925 14.925 8.28V12.2558ZM10.1408 12.2558C10.1408 12.5425 9.90583 12.78 9.615 12.78C9.3275 12.78 9.0925 12.5425 9.0925 12.2558V8.28C9.0925 7.9925 9.3275 7.755 9.6175 7.755C9.90583 7.755 10.1408 7.9925 10.1408 8.28V12.2558ZM8.08583 12.78H6.0975C5.81 12.78 5.5725 12.5425 5.5725 12.2558V8.28C5.5725 7.9925 5.81 7.755 6.0975 7.755C6.3875 7.755 6.6225 7.9925 6.6225 8.28V11.7308H8.08583C8.37583 11.7308 8.61 11.9667 8.61 12.2558C8.61 12.5425 8.375 12.78 8.08583 12.78ZM22 10.1183C22 5.6425 17.5125 2 12 2C6.4875 2 2 5.6425 2 10.1183C2 14.1275 5.55833 17.4867 10.3625 18.125C10.6883 18.1933 11.1317 18.34 11.2442 18.6167C11.3442 18.8675 11.31 19.255 11.2758 19.5167L11.1392 20.3667C11.1017 20.6175 10.9392 21.355 12.0133 20.9042C13.0892 20.455 17.7767 17.5058 19.8767 15.0917C21.3133 13.5175 22 11.905 22 10.1183Z"
                      fill="white"
                    />
                  </svg>
                }
              /> */}
            </div>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
