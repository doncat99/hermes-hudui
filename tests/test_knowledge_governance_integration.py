from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.file_watcher import _detect_change_type
from backend.main import app


def test_knowledge_governance_tab_is_registered_in_frontend_shell() -> None:
    top_bar = (ROOT / "frontend/src/components/TopBar.tsx").read_text()
    app_tsx = (ROOT / "frontend/src/App.tsx").read_text()
    translations = (ROOT / "frontend/src/i18n/translations.ts").read_text()

    assert "id: 'knowledge-governance'" in top_bar
    assert "case 'knowledge-governance': return <KnowledgeGovernancePanel />" in app_tsx
    assert "'knowledge-governance': 'grid-cols-1'" in app_tsx
    assert "{ id: 'knowledge-governance', label: 'tab.knowledgeGovernance'" in app_tsx
    assert "'tab.knowledgeGovernance': 'Knowledge'" in translations
    assert "'tab.knowledgeGovernance': '知识治理'" in translations
    assert "function initialTabFromLocation(): TabId" in app_tsx
    assert "if (path.startsWith('/session/')) return 'knowledge-governance'" in app_tsx
    assert "window.history.replaceState(null, '', '/knowledge-governance')" in app_tsx


def test_knowledge_governance_panel_distinguishes_project_projection_and_runtime_state() -> None:
    panel = (ROOT / "frontend/src/components/KnowledgeGovernancePanel.tsx").read_text()
    translations = (ROOT / "frontend/src/i18n/translations.ts").read_text()

    assert "const projectState = projectRun.state || operatorStatus.status || '-'" in panel
    assert "const projectionStatus = runtime.projection_status || kanbanProjection.projection_status || '-'" in panel
    assert "const runtimeState = runtime.runtime_state || runtime.reconciled_state || '-'" in panel
    assert "knowledgeGovernance.projectState" in panel
    assert "'knowledgeGovernance.projectState': 'Project State'" in translations
    assert "'knowledgeGovernance.projectState': '项目状态'" in translations


def test_knowledge_governance_api_route_is_registered() -> None:
    paths = {route.path for route in app.routes}
    assert "/api/knowledge-governance" in paths


def test_knowledge_governance_websocket_invalidation_is_registered() -> None:
    hook = (ROOT / "frontend/src/hooks/useWebSocket.ts").read_text()
    assert "'knowledge-governance': '/knowledge-governance'" in hook


def test_knowledge_governance_file_watcher_detects_ontosynth_artifacts() -> None:
    cases = [
        Path("/repo/artifacts/operator/status.json"),
        Path("/repo/artifacts/ontology/knowledge_governance_console/project_data_view.json"),
        Path("/repo/artifacts/ontology/project_data_catalog.json"),
        Path("/repo/artifacts/runs/knowledge_governance_console_v1/project_run.json"),
        Path("/repo/artifacts/runs/knowledge_governance_console_v1/kanban_projection.json"),
        Path("/repo/artifacts/governance/promotions/kc.platform_acceptance_smoke/candidate.json"),
    ]

    for path in cases:
        assert "knowledge-governance" in _detect_change_type(path)
