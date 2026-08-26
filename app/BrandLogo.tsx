import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}

export default function BrandLogo({
  className = "",
  compact = false,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/lilian-arruda-logo-transparent.png"
      alt="Lilian Arruda - Consultoria, Educação e Saúde Corporativa"
      width={2400}
      height={761}
      priority={priority}
      className={`${className || (compact ? "h-11" : "h-14")} max-w-full w-auto object-contain`}
    />
  );
}
