import FinalTestView from "@/components/learn/FinalTestView";

export default async function FinalTestPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <FinalTestView courseId={courseId} />;
}
