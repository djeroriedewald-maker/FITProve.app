import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  right,
}: {
  title: string;
  value: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-2xl font-extrabold mt-1 text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
