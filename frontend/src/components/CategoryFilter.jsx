const CATEGORIES = [
  { value: "", label: "All" },
  { value: "tshirt", label: "T-Shirts" },
  { value: "dress", label: "Dresses" },
  { value: "shoe", label: "Shoes" },
  { value: "bag", label: "Bags" },
  { value: "hat", label: "Hats" },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="filter-row">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value || "all"}
          className={`filter-pill ${value === cat.value ? "active" : ""}`}
          onClick={() => onChange(cat.value)}
          type="button"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
