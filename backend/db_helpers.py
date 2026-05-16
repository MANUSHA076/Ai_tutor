import concurrent.futures

from supabase_client import get_supabase, is_configured

_DB_TIMEOUT_SEC = 25


def _run_timed(fn, timeout: int = _DB_TIMEOUT_SEC):
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn)
        return future.result(timeout=timeout)


def safe_table_query(table: str, build_query, timeout: int = _DB_TIMEOUT_SEC):
    if not is_configured():
        return []
    try:

        def run():
            result = build_query(get_supabase().table(table)).execute()
            return result.data or []

        return _run_timed(run, timeout=timeout)
    except Exception:
        return []


def count_table(table: str) -> int:
    rows = safe_table_query(table, lambda q: q.select("id"))
    return len(rows)


def latest_lecture() -> dict | None:
    rows = safe_table_query(
        "lectures",
        lambda q: q.select("*").order("created_at", desc=True).limit(1),
    )
    return rows[0] if rows else None


def latest_document() -> dict | None:
    rows = safe_table_query(
        "documents",
        lambda q: q.select("*").order("created_at", desc=True).limit(1),
    )
    return rows[0] if rows else None


def search_lectures(query: str, limit: int = 10) -> list[dict]:
    if not query.strip():
        return []
    pattern = f"%{query.strip()}%"
    return safe_table_query(
        "lectures",
        lambda q: q.select("id,title,subject").ilike("title", pattern).limit(limit),
    )


def search_documents(query: str, limit: int = 10) -> list[dict]:
    if not query.strip():
        return []
    pattern = f"%{query.strip()}%"
    return safe_table_query(
        "documents",
        lambda q: q.select("id,name,status").ilike("name", pattern).limit(limit),
    )
