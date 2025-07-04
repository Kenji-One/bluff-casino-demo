"use client";

// import { Header } from "./shared";
// import { DollarSign } from "lucide-react";
// import clsx from "clsx";

// export default function TransactionHistoryTab() {
//   const rows = [
//     {
//       date: "11/02/25",
//       type: "Deposit",
//       amount: 5000,
//       receive: 5000,
//       status: "Success",
//     },
//     {
//       date: "11/02/25",
//       type: "Withdrawal",
//       amount: -5000,
//       receive: null,
//       status: "Failed",
//     },
//     {
//       date: "11/02/25",
//       type: "Deposit",
//       amount: 5000,
//       receive: 5000,
//       status: "Success",
//     },
//     {
//       date: "11/02/25",
//       type: "Withdrawal",
//       amount: -5000,
//       receive: null,
//       status: "Failed",
//     },
//     {
//       date: "11/02/25",
//       type: "Deposit",
//       amount: 5000,
//       receive: 5000,
//       status: "Success",
//     },
//     {
//       date: "11/02/25",
//       type: "Deposit",
//       amount: 5000,
//       receive: 5000,
//       status: "Success",
//     },
//     {
//       date: "11/02/25",
//       type: "Withdrawal",
//       amount: -5000,
//       receive: null,
//       status: "Failed",
//     },
//   ];

//   return (
//     <section className="space-y-6">
//       <Header
//         title="Transaction History"
//         subtitle="View and edit your user information"
//       />

//       {/* Table Headers */}
//       <div className="grid grid-cols-5 text-sm text-gray-500 px-2">
//         <span>Date</span>
//         <span>Type</span>
//         <span>Amount</span>
//         <span>Receive</span>
//         <span>Status</span>
//       </div>

//       {/* Transaction Rows */}
//       <div className="space-y-2">
//         {rows.map((r, idx) => (
//           <div
//             key={idx}
//             className="grid grid-cols-5 items-center bg-[#1C1C22] rounded-lg px-4 py-3 text-sm text-white"
//           >
//             <div>{r.date}</div>

//             <div
//               className={clsx(
//                 "font-medium",
//                 r.type === "Deposit" ? "text-white" : "text-white"
//               )}
//             >
//               {r.type}
//             </div>

//             <div
//               className={clsx(
//                 "font-medium",
//                 r.amount > 0 ? "text-green-400" : "text-red-400"
//               )}
//             >
//               {r.amount > 0 ? "+$" : "-$"}
//               {Math.abs(r.amount).toLocaleString()}
//             </div>

//             <div className="flex items-center gap-1">
//               {r.receive != null && (
//                 <div className="w-5 h-5 rounded-full bg-[#6CDE07] text-xs text-white flex items-center justify-center">
//                   $
//                 </div>
//               )}
//               {r.receive != null ? r.receive.toLocaleString() : "-"}
//             </div>

//             <div
//               className={clsx(
//                 "font-medium text-right",
//                 r.status === "Success" ? "text-green-400" : "text-red-400"
//               )}
//             >
//               {r.status}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import WalletBalance from "@/components/wallet/WalletBalance";
import TransactionHistory from "@/components/wallet/TransactionHistory";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">My Wallet</h1>
      <WalletBalance />
      <TransactionHistory />
    </div>
  );
}
