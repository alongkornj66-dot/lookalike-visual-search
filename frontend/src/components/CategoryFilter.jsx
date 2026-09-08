const CATEGORIES = [
  { value: "", label: "All" },
  { value: "tshirt", label: "T-Shirts" },
  { value: "dress", label: "Dresses" },
  { value: "shoe", label: "Shoes" },
  { value: "bag", label: "Bags" },
  { value: "hat", label: "Accessories" },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="filter-tabs">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value || "all"}
          className={`filter-tab ${value === cat.value ? "active" : ""}`}
          onClick={() => onChange(cat.value)}
          type="button"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
