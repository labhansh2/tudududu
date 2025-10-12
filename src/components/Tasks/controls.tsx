"use client";

interface Props {
  sort: "all" | "completed" | "incomplete";
  setSort: (sort: "all" | "completed" | "incomplete") => void;
  detailedView: boolean;
  setDetailedView: (detailedView: boolean) => void;
}

export default function Controls({
  sort,
  setSort,
  detailedView,
  setDetailedView,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center gap-2">
        {/* Filter buttons */}
        <div 
          className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-[var(--bg-lighter)] rounded-[var(--border-radius)] flex-shrink-0"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <FilterButton
            sort="all"
            selected={sort === "all"}
            setSort={setSort}
          />
          <FilterButton
            sort="incomplete"
            selected={sort === "incomplete"}
            setSort={setSort}
          />
          <FilterButton
            sort="completed"
            selected={sort === "completed"}
            setSort={setSort}
          />
        </div>

        {/* View toggle */}
        <div 
          className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 bg-[var(--bg-lighter)] rounded-[var(--border-radius)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <span className="text-[10px] sm:text-xs font-medium text-[var(--foreground)] whitespace-nowrap">
            Detailed
          </span>
          <ToggleSwitch
            checked={detailedView}
            onChange={setDetailedView}
          />
        </div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  sort: "all" | "completed" | "incomplete";
  selected: boolean;
  setSort: (sort: "all" | "completed" | "incomplete") => void;
}

function FilterButton({ sort, selected, setSort }: FilterButtonProps) {
  return (
    <button
      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${
        selected
          ? "bg-[var(--accent)] text-white relative overflow-hidden"
          : "text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--bg-lightest)]"
      }`}
      style={selected ? {
        boxShadow: 'var(--shadow-md)',
        background: 'linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)',
      } : {}}
      onClick={() => setSort(sort)}
    >
      {selected && (
        <span 
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{ 
            background: 'var(--gradient-button)',
            opacity: 0.6
          }}
        />
      )}
      <span className="relative z-10">
        {sort.charAt(0).toUpperCase() + sort.slice(1)}
      </span>
    </button>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-lighter)] ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--bg-base)]"
      }`}
      style={checked ? { 
        boxShadow: 'var(--shadow-inset)',
        background: 'linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)'
      } : {
        boxShadow: 'var(--shadow-inset)'
      }}
    >
      <span
        className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-[1.125rem] sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1"
        }`}
        style={{
          boxShadow: 'var(--shadow-sm)'
        }}
      />
    </button>
  );
}
