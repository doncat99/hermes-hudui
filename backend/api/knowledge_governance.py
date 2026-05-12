from __future__ import annotations

import sys
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _ensure_repo_importable(repo_root: Path) -> None:
    repo_root_str = str(repo_root)
    if repo_root_str not in sys.path:
        sys.path.insert(0, repo_root_str)


@router.get("/knowledge-governance")
async def get_knowledge_governance() -> dict[str, Any]:
    repo_root = _repo_root()
    _ensure_repo_importable(repo_root)
    from kernel.runtime.application.knowledge_governance_hud_payload import (
        build_knowledge_governance_payload,
    )

    return build_knowledge_governance_payload(repo_root)
