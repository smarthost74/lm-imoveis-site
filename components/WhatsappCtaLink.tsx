"use client";

import type { ReactNode } from "react";
import { trackLeadEvent } from "@/lib/analytics";

/** Link `wa.me` com o evento GA4 de lead — para uso em Server Components. */
export function WhatsappCtaLink({
  href,
  origem,
  className,
  children,
}: {
  href: string;
  origem: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackLeadEvent("whatsapp", { origem })}
      className={className}
    >
      {children}
    </a>
  );
}
