"use client";
import { cn } from "@/lib/utils";

export interface AceternityCardProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  hoverImage?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function AceternityCard({
  title = "Background Overlays",
  description = "This card is for some special elements, like displaying background gifs on hover only.",
  backgroundImage = "https://images.unsplash.com/photo-1476842634003-7dcca8f832de?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
  hoverImage = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWlodTF3MjJ3NnJiY3Rlc2J0ZmE0c28yeWoxc3gxY2VtZzA5ejF1NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/syEfLvksYQnmM/giphy.gif",
  className,
  children,
}: AceternityCardProps) {
  return (
    <div className={cn("max-w-xs w-full", className)}>
      <div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          "bg-cover bg-center transition-all duration-500",
          // Always have a gradient overlay for text readability
          "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/70 before:via-black/20 before:to-transparent before:z-10",
          // Additional overlay on hover
          "hover:after:content-[''] hover:after:absolute hover:after:inset-0 hover:after:bg-black hover:after:opacity-30 hover:after:z-20",
        )}
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundImage = `url(${hoverImage})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundImage = `url(${backgroundImage})`;
        }}
      >
        <div className="text relative z-50">
          {children ? (
            children
          ) : (
            <>
              <h1 className="font-bold text-xl md:text-3xl text-white relative drop-shadow-lg">
                {title}
              </h1>
              <p className="font-normal text-base text-gray-100 relative my-4 drop-shadow-md">
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Demo component with default styling
export function AceternityCardDemo() {
  return <AceternityCard />;
}
