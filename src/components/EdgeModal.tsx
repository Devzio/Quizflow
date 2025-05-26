<div className="form-group">
  <label htmlFor="criteria">Edge Criteria:</label>
  <select
    id="criteria"
    name="criteria"
    value={selectedCriteriaId}
    onChange={handleCriteriaChange}
    required
  >
    <option value="">Select edge criteria</option>
    {criteria.filter(c => c.value && c.label).map(c => (
      <option key={c.id} value={c.id}>{c.label} ({c.value})</option>
    ))}
  </select>
</div>