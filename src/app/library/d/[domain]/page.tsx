import DomainHub from "@/components/learn/DomainHub";
import { DOMAINS } from "@/lib/learn/registry";

// Every domain hub — see the note in ../../[courseId]/page.tsx.
export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.id }));
}

export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return <DomainHub domain={domain} />;
}
