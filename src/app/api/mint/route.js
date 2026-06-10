import { NextResponse } from 'next/server';
import { readState, mutateState } from '@/lib/store';

// Fake tx hash: looks like a real one, costs nothing.
const fakeTxHash = () =>
  '0x' +
  Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

export async function GET() {
  const state = readState();
  return NextResponse.json({ mints: state.mints });
}

export async function POST(request) {
  const { id, owner } = await request.json();
  const tokenId = Number(id);

  if (!Number.isInteger(tokenId) || tokenId < 1) {
    return NextResponse.json({ error: 'invalid token id' }, { status: 400 });
  }

  const result = mutateState((state) => {
    if (state.mints[tokenId]) {
      return { alreadyMinted: true, mint: state.mints[tokenId] };
    }
    const mint = {
      id: tokenId,
      owner: owner || '0xanonymous',
      txHash: fakeTxHash(),
      mintedAt: new Date().toISOString(),
    };
    state.mints[tokenId] = mint;
    return { alreadyMinted: false, mint };
  });

  return NextResponse.json(result, { status: result.alreadyMinted ? 409 : 201 });
}
