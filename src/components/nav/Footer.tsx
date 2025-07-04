/* -------------------------------------------------
 *  Visabet – Footer
 *  Tailwind & Next.js (TS) – no runtime deps
 * ------------------------------------------------- */

"use client";

import { useState } from "react";
import Link from "next/link";
import CustomSelect, { SelectOption } from "../settings/shared/CustomSelect";

const NOW_YEAR = new Date().getFullYear();

/* ———————————————————————————————————————————— */
/*  Component                                                 */
export default function Footer() {
  const [lang, setLang] = useState("en");
  const [odds, setOdds] = useState("decimal");

  const langOpts: SelectOption<string>[] = [
    {
      label: "ENG",
      value: "en",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.5 9.4375C2.64228 7.55105 3.4942 5.78791 4.88505 4.50138C6.2759 3.21485 8.10292 2.49997 10 2.5C9.37575 2.5 8.81919 2.773 8.36041 3.19075C7.90539 3.60625 7.52106 4.18675 7.20969 4.87225C6.89681 5.56225 6.65313 6.36925 6.48842 7.2445C6.35483 7.96866 6.27489 8.70164 6.24925 9.4375H2.5ZM2.5 10.5625H6.24925C6.27632 11.314 6.3568 12.0535 6.48842 12.7555C6.65388 13.6307 6.89681 14.4377 7.20969 15.1278C7.52106 15.8132 7.90539 16.3938 8.36041 16.8092C8.81919 17.227 9.37575 17.5 10 17.5C6.0364 17.5 2.78806 14.4423 2.5 10.5625Z"
            fill="white"
          />
          <path
            d="M10 3.33331C9.79821 3.33331 9.53772 3.42396 9.23466 3.71681C8.92941 4.01199 8.62342 4.47451 8.35339 5.10438C8.08482 5.73037 7.86689 6.48574 7.7172 7.33021C7.59979 7.99494 7.52642 8.69996 7.5 9.41892H12.5C12.4761 8.71801 12.4035 8.0199 12.2828 7.33021C12.1331 6.48574 11.9159 5.73037 11.6466 5.10438C11.3766 4.47451 11.0713 4.01199 10.7661 3.71759C10.4623 3.42396 10.2018 3.33331 10 3.33331ZM7.7172 12.6697C7.86689 13.5142 8.08482 14.2696 8.35339 14.8956C8.62342 15.5254 8.92941 15.988 9.23393 16.2824C9.53772 16.576 9.79894 16.6666 10 16.6666C10.2018 16.6666 10.4623 16.576 10.7653 16.2831C11.0713 15.988 11.3766 15.5254 11.6466 14.8956C11.9152 14.2696 12.1331 13.5142 12.2828 12.6697C12.4009 12.005 12.4743 11.3 12.5 10.581H7.5C7.52568 11.3 7.59906 12.005 7.7172 12.6697Z"
            fill="white"
          />
          <path
            d="M10 2.5C10.625 2.5 11.1808 2.773 11.6396 3.19075C12.0946 3.60625 12.4797 4.18675 12.7903 4.87225C13.1039 5.56225 13.3469 6.36925 13.5116 7.2445C13.6432 7.9465 13.7237 8.686 13.7508 9.4375H17.5C17.3577 7.55105 16.5058 5.78791 15.115 4.50138C13.7241 3.21485 11.8971 2.49997 10 2.5ZM13.5116 12.7555C13.3469 13.6307 13.1039 14.4377 12.7903 15.1278C12.4797 15.8132 12.0946 16.3938 11.6396 16.8092C11.1808 17.227 10.625 17.5 10 17.5C13.9636 17.5 17.2119 14.4423 17.5 10.5625H13.7508C13.7251 11.2984 13.6452 12.0313 13.5116 12.7555Z"
            fill="white"
          />
        </svg>
      ),
    },
    { label: "ESP", value: "es" },
    { label: "FR", value: "fr" },
  ];

  const oddsOpts: SelectOption<string>[] = [
    { label: "Decimal", value: "decimal" },
    { label: "Fraction", value: "fraction" },
    { label: "American", value: "american" },
  ];
  /** quick-change arrays — keeps JSX tidy  */
  const groups = [
    {
      heading: "Support",
      links: ["Live Support", "Help Center", "Game Responsibly"],
    },
    {
      heading: "Platform",
      links: [
        "Provably Fair",
        "Affiliate Program",
        "Redeem Code",
        "VIP Program",
      ],
    },
    {
      heading: "Policy",
      links: [
        "Terms of Service",
        "Privacy Policy",
        "Responsible Gaming",
        "AML Policy",
        "License",
        "Sports",
        "Lottery",
        "Convert",
      ],
    },
    {
      heading: "Community",
      links: ["X", "Instagram", "TikTok", "Facebook", "Telegram", "Merch"],
    },
  ];

  return (
    <footer className="mt-8 p-4">
      <div className="mx-auto pb-8 mb-12 max-w-screen-2xl rounded-2xl bg-[var(--footer-bg)]">
        {/* ——— top bar ——— */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-8 pb-6">
          {/* logo + copyright */}
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold tracking-tight text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="85"
                height="16"
                viewBox="0 0 85 16"
                fill="none"
              >
                <path
                  d="M5.01118 15.6924L0 0.307251H3.84639L7.25301 11.6261L10.6596 0.307251H14.506L9.49483 15.6924H5.01118Z"
                  fill="#4264FF"
                />
                <path
                  d="M15.8245 0.307617H19.3408V15.6927H15.8245V0.307617Z"
                  fill="#4264FF"
                />
                <path
                  d="M27.1433 16C25.5755 16 24.2676 15.6594 23.2201 14.9778C22.1722 14.2967 21.429 13.3699 20.9893 12.1975L24.0224 10.4393C24.6377 11.8607 25.7147 12.5714 27.253 12.5714C28.6449 12.5714 29.3408 12.154 29.3408 11.3188C29.3408 10.8647 29.1171 10.5094 28.6706 10.2528C28.2237 9.99662 27.3847 9.69994 26.1541 9.36273C25.5092 9.18675 24.9454 8.98924 24.4617 8.76936C23.9781 8.54948 23.5058 8.26039 23.0441 7.90124C22.5824 7.54252 22.2309 7.09179 21.989 6.54948C21.7472 6.0076 21.6265 5.38468 21.6265 4.68116C21.6265 3.26018 22.1355 2.1245 23.1539 1.27453C24.1722 0.424985 25.3847 0 26.7913 0C28.0515 0 29.1648 0.296688 30.1321 0.890062C31.099 1.48344 31.8608 2.34437 32.4178 3.47246L29.4505 5.20869C29.172 4.62291 28.8276 4.17936 28.4174 3.87888C28.0072 3.57881 27.4649 3.42815 26.7909 3.42815C26.2634 3.42815 25.857 3.54167 25.5712 3.76873C25.2855 3.9962 25.1425 4.27094 25.1425 4.59295C25.1425 4.97405 25.3218 5.30365 25.681 5.58219C26.0397 5.86073 26.7833 6.16839 27.9118 6.50517C28.5271 6.69593 29.0032 6.84955 29.3404 6.96687C29.6772 7.08419 30.1059 7.27833 30.6263 7.54927C31.1462 7.82064 31.5417 8.10635 31.8131 8.40641C32.084 8.7069 32.3258 9.10234 32.5385 9.59316C32.7508 10.0844 32.8572 10.6449 32.8572 11.2745C32.8572 12.7398 32.3296 13.8936 31.2745 14.736C30.2195 15.5788 28.842 15.9996 27.1425 15.9996L27.1433 16Z"
                  fill="#4264FF"
                />
                <path
                  d="M44.1763 15.6924L43.4069 13.2745H37.6927L36.9233 15.6924H33.0769L38.308 0.307251H42.7916L48.0227 15.6924H44.1763ZM38.7477 9.97807H42.3523L40.5502 4.32962L38.7481 9.97807H38.7477Z"
                  fill="#4264FF"
                />
                <path
                  d="M58.88 7.7143C60.1402 8.52038 60.7703 9.67801 60.7703 11.1868C60.7703 12.5204 60.2938 13.6046 59.3417 14.4398C58.3892 15.275 57.2096 15.6924 55.803 15.6924H49.3413V0.307251H55.3633C56.7403 0.307251 57.8942 0.713667 58.8247 1.52692C59.7549 2.34017 60.2204 3.39904 60.2204 4.70269C60.2204 5.93333 59.7731 6.93734 58.8796 7.71388L58.88 7.7143ZM55.3637 3.60415H52.8581V6.32962H55.3637C55.7591 6.32962 56.0816 6.20132 56.3306 5.94515C56.5796 5.68898 56.704 5.36275 56.704 4.96731C56.704 4.57187 56.5796 4.24564 56.3306 3.98904C56.0811 3.73287 55.7591 3.60457 55.3637 3.60457V3.60415ZM55.803 12.3959C56.2428 12.3959 56.5943 12.2604 56.8581 11.9895C57.1219 11.7185 57.2535 11.3632 57.2535 10.9234C57.2535 10.4837 57.1219 10.1287 56.8581 9.85737C56.5943 9.58642 56.2428 9.45095 55.803 9.45095H52.8581V12.3959H55.803Z"
                  fill="white"
                />
                <path
                  d="M66.0447 12.3077H72.1987V15.6924H62.5283V0.307251H72.089V3.69193H66.0451V6.24142H71.5395V9.5822H66.0451V12.3077H66.0447Z"
                  fill="white"
                />
                <path
                  d="M84.5069 0.307617V3.6923H80.5508V15.6927H77.0345V3.6923H73.0784V0.307617H84.5074H84.5069Z"
                  fill="white"
                />
              </svg>
            </Link>
            <p className="mt-3 text-xs text-white font-semibold tracking-tight">
              © {NOW_YEAR} Visabet.com | All Rights Reserved
            </p>
          </div>

          {/* socials – now clickable */}
          <div className="flex items-center gap-4">
            <Link
              href="https://t.me/visabet" /* replace with real URL */
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.936 5.17003L18.906 19.355C18.68 20.354 18.1 20.579 17.262 20.128L12.717 16.776L10.492 18.903C10.267 19.129 10.041 19.355 9.52503 19.355L9.88003 14.68L18.358 6.97603C18.712 6.62103 18.261 6.49203 17.81 6.78303L7.26903 13.423L2.72303 12.037C1.72403 11.715 1.72403 11.037 2.94903 10.587L20.614 3.72003C21.484 3.46203 22.226 3.91403 21.936 5.17003Z"
                  fill="white"
                />
              </svg>
            </Link>

            <Link
              href="https://twitter.com/visabet" /* replace with real URL */
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <mask
                  id="mask0_161_526"
                  style={{ maskType: "luminance" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                >
                  <path d="M0 0H24V24H0V0Z" fill="white" />
                </mask>
                <g mask="url(#mask0_161_526)">
                  <path
                    d="M17.7101 3H20.756L14.1024 10.6239L21.9306 21H15.802L10.9984 14.7082L5.50818 21H2.45947L9.57549 12.8427L2.06934 3.00142H8.35402L12.6895 8.75126L17.7101 3ZM16.639 19.1728H18.3272L7.43188 4.73219H5.62167L16.639 19.1728Z"
                    fill="white"
                  />
                </g>
              </svg>
            </Link>

            <Link
              href="https://instagram.com/visabet" /* replace with real URL */
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z"
                  fill="white"
                />
              </svg>
            </Link>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* ——— middle grid ——— */}
        <div className="grid gap-10 px-8 pb-8 pt-6 md:grid-cols-5 ">
          {/* nav columns */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {groups.map((grp) => (
              <nav key={grp.heading} className="space-y-3">
                <h3 className="font-semibold text-white">{grp.heading}</h3>
                <ul className="space-y-[6px] text-sm text-[var(--secondary-text)]">
                  {grp.links.map((l) => (
                    <li key={l}>
                      <Link href="/" className="hover:text-white">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* --- JSX (replace previous button skeleton) ------------------- */}
          <div className="space-y-4">
            <CustomSelect
              value={lang}
              onChange={setLang}
              options={langOpts}
              boxClassName="w-full"
              className="!py-2 !bg-[var(--surface-l3)]"
            />

            <CustomSelect
              value={odds}
              onChange={setOdds}
              options={oddsOpts}
              boxClassName="w-full"
              className="!py-2 !px-4 !bg-[var(--surface-l3)]"
            />

            <p className="text-right mt-[-4px] text-sm text-[var(--secondary-text)]">
              1&nbsp;BTC&nbsp;=&nbsp;$93,196.65
            </p>
          </div>
        </div>

        {/* ——— disclaimer ——— */}
        <p className="px-8 text-justify text-xs leading-relaxed text-[var(--secondary-text-2)]">
          Visabet is owned and operated by Natural Nine B.V., Curaçao company
          registration number 160998, with its registered address at
          Korporaalweg 10, Willemstad, Curaçao and is licensed by the Curaçao
          Gaming Control Board to offer games of chance under license number
          OGL/2024/1337/0628. Shuffle’s payment agent company is River Card
          Limited, Cyprus company registration number HE 431566, with its
          registered address at 50 Spyrou Kyprianou Avenue, Irida Tower 3, Floor
          6, 6057 Larnaca, Cyprus. Contact us at support@shuffle.com.
        </p>
      </div>
    </footer>
  );
}
