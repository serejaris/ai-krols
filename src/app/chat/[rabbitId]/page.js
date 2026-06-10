import { redirect } from 'next/navigation';

// The old rabbit chat is superseded by the agent room.
export default async function ChatRedirect({ params }) {
  const { rabbitId } = await params;
  redirect(`/agent/${rabbitId}`);
}
