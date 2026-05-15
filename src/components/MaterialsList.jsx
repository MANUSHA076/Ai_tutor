export function MaterialsList({ materials }) {
  return (
    <div className="panel">
      <h3>Uploaded Learning Materials</h3>
      <div className="materials-list">
        {materials.map((item) => (
          <article key={item.id} className="material-card">
            <div>
              <p className="material-name">{item.name}</p>
              <p className="material-meta">
                {item.type} • {item.pages} pages
              </p>
            </div>
            <span className="material-pill">{item.minutes} min lecture</span>
          </article>
        ))}
      </div>
    </div>
  )
}
