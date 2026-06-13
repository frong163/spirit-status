import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VIEW_MAP: Record<string, string> = {
  spirit: 'leaderboard_spirit',
  luck: 'leaderboard_luck',
  wealth: 'leaderboard_wealth',
  love: 'leaderboard_love',
  career: 'leaderboard_career',
  energy: 'leaderboard_energy',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'spirit';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

  const viewName = VIEW_MAP[type] ?? 'leaderboard_spirit';

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(viewName)
    .select('*')
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
