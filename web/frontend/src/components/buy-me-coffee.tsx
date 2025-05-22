import { Button, buttonVariants } from "@/components/ui/button"
import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type ButtonProps = ComponentPropsWithoutRef<typeof Button>
type ButtonVariants = VariantProps<typeof buttonVariants>

interface BuyMeCoffeeProps extends ButtonProps {
    className?: string
    variant?: ButtonVariants["variant"]
    size?: ButtonVariants["size"]
}

const imageSizes = {
    default: "h-[45px] w-[160px]",
    sm: "h-[35px] w-[125px]",
    lg: "h-[60px] w-[217px]",
    icon: "h-[35px] w-[125px]"
} as const

export default function BuyMeCoffee({ 
    className, 
    variant = "outline",
    size = "lg",
    ...props 
}: BuyMeCoffeeProps) {
    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "p-0 border-none transition-all duration-200 hover:scale-105 hover:shadow-lg",
                className
            )}
            asChild
            {...props}
        >
            <a 
                href="https://www.buymeacoffee.com/zifcak" 
                target="_blank" 
                rel="noopener noreferrer"
            >
                <img 
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                    alt="Buy Me A Coffee" 
                    className={imageSizes[size ?? "default"]}
                />
            </a>
        </Button>
    )
}
