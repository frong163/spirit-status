import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateSpiritScore, getAuraTier } from '@/lib/game';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { count: rankCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('spirit_score', profile.spirit_score);

  const { count: total } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    ...profile,
    global_rank: (rankCount ?? 0) + 1,
    total_users: total ?? 1,
  });
}
