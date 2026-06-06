import { InterviewRoom } from "@/features/interview/interview-room";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InterviewRoom id={id} />;
}
