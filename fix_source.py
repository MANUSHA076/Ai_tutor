from pathlib import Path

path = Path("src/components/dashboard/SourceDocument.jsx")
lines = path.read_text(encoding="utf-8").splitlines()
d = "div"
lines[73] = f"            <{d}>"
lines[76] = f"            </{d}>"
lines[77] = f"          </{d}>"
path.write_text("\n".join(lines) + "\n", encoding="utf-8")
