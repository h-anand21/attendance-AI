import { cn } from "@/lib/utils"

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <circle cx="50" cy="50" r="50" className="fill-primary" />
        <path
          d="M30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50C70 55.3043 67.8929 60.1957 64.4772 63.636"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M50 50L69.3175 69.3175"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
