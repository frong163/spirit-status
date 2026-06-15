'use client';
import { Clover, Coins, Heart, Briefcase, Zap, type LucideIcon } from 'lucide-react';
import type { UserAttributes } from '@/types';

const ATTR_META: { key: keyof UserAttributes; label: string; icon: LucideIcon }[] = [
  { key: 'luck',   label: 'โชคลาภ',   icon: Clover    },
  { key: 'wealth', label: 'การเงิน',   icon: Coins     },
  { key: 'love',   label: 'ความรัก',   icon: Heart     },
  { key: 'career', label: 'การงาน',    icon: Briefcase },
  { key: 'energy', label: 'พลังงาน',   icon: Zap       },
];

interface AttributeCardsProps {
  attributes: UserAttributes;
  /** ค่าก่อนจั่วไพ่ — ถ้ามีจะแสดง +/- */
  prevAttributes?: UserAttributes | null;
}

export function AttributeCards({ attributes, prevAttributes }: AttributeCardsProps) {
  return (
    <section aria-label="ดวงรายด้าน" className="flex flex-col gap-3">
      {ATTR_META.map(({ key, label, icon: Icon }) => {
        const value = attributes[key];
        const prev  = prevAttributes?.[key];
        const diff  = prev !== undefined ? value - prev : 0;

        return (
          <div
            key={key}
            className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-base font-semibold text-foreground">{label}</span>
                <div className="flex items-baseline gap-1.5">
                  {diff !== 0 && (
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: diff > 0 ? '#16A34A' : '#DC2626' }}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                  <span className="text-lg font-bold tabular-nums text-primary">{value}</span>
                </div>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
