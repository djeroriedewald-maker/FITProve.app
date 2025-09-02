import React from "react";

type Props = React.PropsWithChildren<{
  title?: string;
  className?: string;
}>;

/**
 * Eenvoudige sectie-kaart met optionele titel.
 * Gebruikt dezelfde card-styling als de rest van de UI.
 */
export default function Section({ title, className, children }: Props) {
  return (
    <section className={`card ${className ?? ""}`}>
      {title ? (
        <div className="card-header">
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </section>
  );
}
