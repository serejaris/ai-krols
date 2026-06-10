import { notFound } from 'next/navigation';
import { getPersonality } from '@/utils/personality';
import { getImagePath } from '@/utils/constants';
import AgentRoom from '@/components/AgentRoom/AgentRoom';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const personality = getPersonality(Number(id));
  return {
    title: `${personality.name} · #${id} · Holy Sweet`,
    description: `${personality.archetype} — talk to agent #${id}`,
  };
}

export default async function AgentPage({ params }) {
  const { id } = await params;
  const tokenId = Number(id);

  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > 1458) {
    notFound();
  }

  const personality = getPersonality(tokenId);

  return (
    <AgentRoom
      personality={personality}
      imageSrc={getImagePath(tokenId)}
    />
  );
}
