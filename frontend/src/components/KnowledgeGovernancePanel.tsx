import Panel from './Panel'
import { useApi } from '../hooks/useApi'
import { useTranslation } from '../i18n'

function MetricCard({
  label,
  value,
  tone = 'var(--hud-primary)',
}: {
  label: string
  value: string | number
  tone?: string
}) {
  return (
    <div className="px-3 py-2 border" style={{ borderColor: 'var(--hud-border)' }}>
      <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--hud-text-dim)' }}>{label}</div>
      <div className="text-[13px] font-bold break-words" style={{ color: tone }}>{value}</div>
    </div>
  )
}

function SectionList({ items }: { items: string[] }) {
  if (!items.length) {
    return <div className="text-[13px]" style={{ color: 'var(--hud-text-dim)' }}>-</div>
  }
  return (
    <div className="space-y-1 text-[13px]">
      {items.map((item) => (
        <div key={item} className="break-words" style={{ color: 'var(--hud-text)' }}>{item}</div>
      ))}
    </div>
  )
}

function ChainStatusTone(status: string) {
  if (status === 'written') return 'var(--hud-success)'
  if (status === 'not_written') return 'var(--hud-warning)'
  return 'var(--hud-text-dim)'
}

export default function KnowledgeGovernancePanel() {
  const { t } = useTranslation()
  const { data, isLoading } = useApi('/knowledge-governance', 15000)

  if (isLoading && !data) {
    return (
      <Panel title={t('knowledgeGovernance.title')} className="col-span-full">
        <div className="glow text-[13px] animate-pulse">{t('knowledgeGovernance.loading')}</div>
      </Panel>
    )
  }

  const threeLayer = data?.three_layer_model || {}
  const operatorStatus = data?.operator_status || {}
  const catalog = data?.project_data_catalog || {}
  const projectView = data?.project_data_view || {}
  const projectRun = data?.project_run || {}
  const reviewPacket = data?.review_packet || {}
  const taskRecords = Array.isArray(data?.task_records) ? data.task_records : []
  const skillLoadingContract = data?.skill_loading_contract || {}
  const kanbanProjection = data?.kanban_projection || {}
  const governanceFlow = data?.knowledge_governance_flow || {}
  const governanceChains = Array.isArray(governanceFlow?.chains) ? governanceFlow.chains : []
  const kanban = data?.kanban_overlay || {}
  const statusCounts = kanban.status_counts || {}
  const runtime = data?.knowledge_governance_runtime || {}

  return (
    <>
      <Panel title={t('knowledgeGovernance.title')} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <MetricCard label={t('knowledgeGovernance.workspace')} value={data?.workspace_root || '-'} tone="var(--hud-text)" />
          <MetricCard label={t('knowledgeGovernance.project')} value={data?.project_key || '-'} />
          <MetricCard label={t('knowledgeGovernance.run')} value={projectRun.run_key || data?.run_key || '-'} />
          <MetricCard
            label={t('knowledgeGovernance.state')}
            value={governanceFlow.status || projectRun.state || operatorStatus.status || '-'}
            tone={projectRun.state === 'under_review' ? 'var(--hud-warning)' : 'var(--hud-success)'}
          />
          <MetricCard
            label={t('knowledgeGovernance.runtimePath')}
            value={runtime.runtime_path || '-'}
            tone="var(--hud-text)"
          />
        </div>
      </Panel>

      <Panel title={t('knowledgeGovernance.responsibilityTitle')} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <MetricCard label={t('knowledgeGovernance.promotions')} value={governanceFlow.promotion_count ?? 0} />
          <MetricCard label={t('knowledgeGovernance.writtenBack')} value={governanceFlow.write_back_count ?? 0} tone="var(--hud-success)" />
          <MetricCard label={t('knowledgeGovernance.pendingWriteBack')} value={governanceFlow.pending_write_back_count ?? 0} tone={(governanceFlow.pending_write_back_count || 0) > 0 ? 'var(--hud-warning)' : 'var(--hud-text-dim)'} />
          <MetricCard label={t('knowledgeGovernance.governanceStatus')} value={governanceFlow.status || '-'} />
          <MetricCard label={t('knowledgeGovernance.currentRunDecision')} value={reviewPacket.recommended_decision || '-'} />
        </div>
        <div className="space-y-2">
          {governanceChains.map((chain: any) => (
            <div key={chain.candidate_key} className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-[13px] font-bold break-words" style={{ color: 'var(--hud-primary)' }}>{chain.candidate_key}</div>
                <div className="text-[11px] shrink-0" style={{ color: ChainStatusTone(chain.write_back_status || '') }}>
                  {chain.decision || '-'} / {chain.write_back_status || '-'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                <MetricCard label={t('knowledgeGovernance.proposedBy')} value={chain.proposed_by || '-'} tone="var(--hud-text)" />
                <MetricCard label={t('knowledgeGovernance.allowedApprovers')} value={(chain.allowed_approvers || []).join(', ') || '-'} tone="var(--hud-text)" />
                <MetricCard label={t('knowledgeGovernance.actualDecider')} value={chain.actual_decider || '-'} tone="var(--hud-text)" />
                <MetricCard label={t('knowledgeGovernance.writeBackStatus')} value={chain.write_back_status || '-'} tone={ChainStatusTone(chain.write_back_status || '')} />
                <MetricCard label={t('knowledgeGovernance.writeBackTarget')} value={chain.write_back_target || '-'} tone="var(--hud-text)" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="border p-2" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--hud-text-dim)' }}>
                    {t('knowledgeGovernance.evidenceRefs')}
                  </div>
                  <SectionList items={Array.isArray(chain.evidence_refs) ? chain.evidence_refs : []} />
                </div>
                <div className="border p-2" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'var(--hud-text-dim)' }}>
                    {t('knowledgeGovernance.sourceRefs')}
                  </div>
                  <SectionList items={Array.isArray(chain.source_refs) ? chain.source_refs : []} />
                </div>
              </div>
            </div>
          ))}
          {governanceChains.length === 0 && (
            <div className="text-[13px]" style={{ color: 'var(--hud-text-dim)' }}>
              {t('knowledgeGovernance.noGovernance')}
            </div>
          )}
        </div>
      </Panel>

      <Panel title={t('knowledgeGovernance.reconciliationTitle')} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
          <MetricCard label={t('knowledgeGovernance.requestedBy')} value={projectRun.requested_by || '-'} />
          <MetricCard label={t('knowledgeGovernance.reviewDecision')} value={reviewPacket.recommended_decision || '-'} />
          <MetricCard label={t('knowledgeGovernance.taskRecords')} value={taskRecords.length} />
          <MetricCard label={t('knowledgeGovernance.board')} value={kanban.board || '-'} />
          <MetricCard label={t('knowledgeGovernance.kanbanTasks')} value={kanban.task_count ?? 0} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.runOverlayTitle')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <MetricCard label={t('knowledgeGovernance.state')} value={projectRun.state || '-'} tone={projectRun.state === 'projected' ? 'var(--hud-success)' : 'var(--hud-warning)'} />
              <MetricCard label={t('knowledgeGovernance.allowedApprovers')} value={(reviewPacket.allowed_approvers || []).join(', ') || '-'} tone="var(--hud-text)" />
            </div>
            <div className="space-y-2">
              {taskRecords.map((task: any) => (
                <div key={task.task_key} className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold break-words" style={{ color: 'var(--hud-primary)' }}>
                      {task.runtime_identity || task.task_key}
                    </div>
                    <div className="text-[11px] shrink-0" style={{ color: 'var(--hud-text-dim)' }}>
                      {task.task_type} / {task.status}
                    </div>
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--hud-text-dim)' }}>
                    {task.summary || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.queueOverlayTitle')}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <MetricCard label={t('knowledgeGovernance.tenant')} value={kanban.tenant || '-'} tone="var(--hud-text)" />
              <MetricCard label={t('knowledgeGovernance.kanbanStatus')} value={kanban.status || '-'} tone={kanban.status === 'ready' ? 'var(--hud-success)' : 'var(--hud-warning)'} />
              <MetricCard label={t('knowledgeGovernance.projectionTasks')} value={(kanbanProjection.task_refs || []).length} />
              <MetricCard label={t('knowledgeGovernance.projectedRoleDrift')} value={(skillLoadingContract.projection_drift || []).length} tone={(skillLoadingContract.projection_drift || []).length > 0 ? 'var(--hud-warning)' : 'var(--hud-success)'} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <MetricCard key={status} label={status} value={count as number} tone="var(--hud-text)" />
              ))}
            </div>
            <div className="space-y-2">
              {(kanbanProjection.task_refs || []).map((task: any) => (
                <div key={`projection-${task.kind}-${task.kanban_task_id || task.source_ref}`} className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold break-words" style={{ color: 'var(--hud-primary)' }}>{task.kind}</div>
                    <div className="text-[11px] shrink-0" style={{ color: 'var(--hud-text-dim)' }}>
                      {task.kanban_task_id || '-'}
                    </div>
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--hud-text-dim)' }}>
                    {task.source_ref || '-'}
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--hud-text-dim)' }}>
                    {(task.worker_force_loaded_skill_keys || []).join(', ') || '-'}
                  </div>
                </div>
              ))}
              {(kanban.tasks || []).map((task: any) => (
                <div key={task.id} className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold break-words" style={{ color: 'var(--hud-primary)' }}>{task.title}</div>
                    <div className="text-[11px] shrink-0" style={{ color: 'var(--hud-text-dim)' }}>
                      {task.assignee || '-'} / {task.status || '-'}
                    </div>
                  </div>
                  <div className="text-[11px] mt-1 whitespace-pre-wrap" style={{ color: 'var(--hud-text-dim)' }}>
                    {task.body || '-'}
                  </div>
                </div>
              ))}
              {(!kanban.tasks || kanban.tasks.length === 0) && (
                <div className="text-[13px]" style={{ color: 'var(--hud-text-dim)' }}>
                  {t('knowledgeGovernance.noKanban')}
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={t('knowledgeGovernance.truthTitle')} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <MetricCard label={t('knowledgeGovernance.catalogProjects')} value={catalog.project_count ?? '-'} />
          <MetricCard label={t('knowledgeGovernance.catalogReady')} value={catalog.ready_project_count ?? '-'} tone="var(--hud-success)" />
          <MetricCard label={t('knowledgeGovernance.catalogBlocked')} value={catalog.blocked_project_count ?? '-'} tone={(catalog.blocked_project_count || 0) > 0 ? 'var(--hud-warning)' : 'var(--hud-text-dim)'} />
          <MetricCard label={t('knowledgeGovernance.factCount')} value={projectView?.ontology_facts?.fact_count ?? '-'} />
          <MetricCard label={t('knowledgeGovernance.goalStatus')} value={projectView?.status || '-'} tone={projectView?.ready ? 'var(--hud-success)' : 'var(--hud-warning)'} />
          <MetricCard label={t('knowledgeGovernance.missingRequirements')} value={(projectView?.goal_alignment?.missing_requirement_keys || []).length} tone="var(--hud-warning)" />
        </div>
      </Panel>

      <Panel title={t('knowledgeGovernance.projectionContractsTitle')} className="col-span-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <MetricCard label={t('knowledgeGovernance.sessionPreloadRoles')} value={Object.keys(skillLoadingContract.session_preload_contract || {}).length} />
          <MetricCard label={t('knowledgeGovernance.workerForceLoadRoles')} value={Object.keys(skillLoadingContract.worker_force_load_contract || {}).length} />
          <MetricCard label={t('knowledgeGovernance.projectionTasks')} value={(kanbanProjection.task_refs || []).length} />
          <MetricCard label={t('knowledgeGovernance.projectedRoleDrift')} value={(skillLoadingContract.projection_drift || []).length} tone={(skillLoadingContract.projection_drift || []).length > 0 ? 'var(--hud-warning)' : 'var(--hud-success)'} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.sessionPreloadContract')}</div>
            <div className="space-y-2">
              {Object.entries(skillLoadingContract.session_preload_contract || {}).map(([role, skills]) => (
                <div key={role} className="border p-2" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--hud-primary)' }}>{role}</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--hud-text-dim)' }}>{(skills as string[]).join(', ') || '-'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.workerForceLoadContract')}</div>
            <div className="space-y-2">
              {Object.entries(skillLoadingContract.worker_force_load_contract || {}).map(([role, skills]) => (
                <div key={role} className="border p-2" style={{ borderColor: 'var(--hud-border)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--hud-primary)' }}>{role}</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--hud-text-dim)' }}>{(skills as string[]).join(', ') || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={t('knowledgeGovernance.modelTitle')} className="col-span-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.layerTruth')}</div>
            <div className="text-[11px] mb-2" style={{ color: 'var(--hud-text-dim)' }}>
              {threeLayer?.canonical_truth_layer?.label || '-'}
            </div>
            <SectionList items={threeLayer?.canonical_truth_layer?.authoritative_surfaces || []} />
          </div>
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.layerExecution')}</div>
            <div className="text-[11px] mb-2" style={{ color: 'var(--hud-text-dim)' }}>
              {threeLayer?.hermes_execution_control_plane?.label || '-'}
            </div>
            <SectionList items={threeLayer?.hermes_execution_control_plane?.hermes_objects || []} />
          </div>
          <div className="border p-3" style={{ borderColor: 'var(--hud-border)' }}>
            <div className="text-[13px] font-bold mb-2">{t('knowledgeGovernance.layerConsole')}</div>
            <div className="text-[11px] mb-2" style={{ color: 'var(--hud-text-dim)' }}>
              {threeLayer?.knowledge_governance_console?.label || '-'}
            </div>
            <SectionList items={threeLayer?.knowledge_governance_console?.primary_jobs || []} />
          </div>
        </div>
      </Panel>
    </>
  )
}
