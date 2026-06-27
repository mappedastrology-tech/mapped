import DomainHub from "@/components/learn/DomainHub";

export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return <DomainHub domain={domain} />;
}
