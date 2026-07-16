import type { Metadata } from "next";
import { KIDS_CSS } from "@/components/kids/styles";

export const metadata: Metadata = {
  title: "Home School Quest",
  description: "Your learning adventure.",
  robots: { index: false, follow: false },
};

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kids-root">
      <style dangerouslySetInnerHTML={{ __html: KIDS_CSS }} />
      <div className="kids-shell">{children}</div>
    </div>
  );
}
