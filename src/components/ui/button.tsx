import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1e3a8a] dark:bg-gradient-to-r dark:from-teal-500 dark:to-emerald-500 text-white shadow hover:bg-[#1e3a8a]/90 dark:hover:from-teal-400 dark:hover:to-emerald-400 dark:hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        outline: "border border-[#1e3a8a]/20 dark:border-[#374151] bg-white dark:bg-[#14151e] shadow-sm hover:bg-[#f8fafc] dark:hover:bg-[#1c1d29] dark:text-[#e5e7eb]",
        secondary: "bg-[#f8fafc] dark:bg-[#1c1d29] text-[#1e3a8a] dark:text-[#e5e7eb] shadow-sm hover:bg-[#f8fafc]/80 dark:hover:bg-[#1c1d29]/80",
        ghost: "hover:bg-[#f8fafc] dark:hover:bg-[#1c1d29] hover:text-[#1e3a8a] dark:hover:text-[#e5e7eb]",
        link: "text-[#1e3a8a] dark:text-[#14b8a6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
