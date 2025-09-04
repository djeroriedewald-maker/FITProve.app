import ModuleCard from "../../components/modules/ModuleCard";
import modulesData from "../../data/modules.json";

type RawModule = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
};

const items = (modulesData as RawModule[]).map((m, i) => {
  const idOrSlug = (m.id || m.slug || String(i)).toString();
  const to =
    idOrSlug === "workouts" ? "/modules/workouts" : `/modules/${idOrSlug}`;

  return {
    to,
    title: m.title || m.name || "Module",
    description: m.description ?? "",
    image: m.image,
  };
});

export default function ModulesIndex() {
  return (
    <section className="px-4 py-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Modules</h1>
      </header>

      {/* Altijd 2 kolommen */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((m, idx) => (
          <ModuleCard
            key={`${m.to}-${idx}`}
            to={m.to}
            title={m.title}
            description={m.description}
            image={m.image}
          />
        ))}
      </div>
    </section>
  );
}
