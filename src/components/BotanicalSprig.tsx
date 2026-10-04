export default function BotanicalSprig({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 130"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 116C52 96 64 61 104 42C132 28 161 23 207 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M45 94C32 90 25 82 25 71C36 72 44 79 45 94ZM65 71C53 66 48 57 50 47C61 50 67 58 65 71ZM92 51C82 44 80 35 84 27C94 31 98 40 92 51ZM122 37C116 28 119 19 126 14C133 23 132 31 122 37Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M67 74C77 68 85 69 92 76C83 82 75 81 67 74ZM96 53C106 48 114 50 119 57C110 62 102 60 96 53ZM137 32C146 27 155 29 159 36C150 41 142 39 137 32ZM164 23C169 14 178 11 186 15C183 24 174 28 164 23Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M27 71C28 64 31 57 37 52M50 47C55 40 60 36 66 33M84 27C88 20 93 16 99 13M126 14C133 9 139 7 146 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
