@echo off
mkdir src\components
mkdir src\components\layout
type nul > src\components\layout\NavigationPanel.tsx
type nul > src\components\layout\ContextPanel.tsx
type nul > src\components\layout\ChatPanel.tsx
type nul > src\components\layout\Layout.tsx
mkdir src\components\auth
type nul > src\components\auth\LoginForm.tsx
type nul > src\components\auth\RegisterForm.tsx
mkdir src\components\workflow
mkdir src\components\workflow\designer
mkdir src\components\workflow\designer\nodes
type nul > src\components\workflow\designer\NodePalette.tsx
type nul > src\components\workflow\designer\Canvas.tsx
type nul > src\components\workflow\designer\nodes\HumanTaskNode.tsx
type nul > src\components\workflow\designer\nodes\SystemTaskNode.tsx
type nul > src\components\workflow\designer\nodes\AINode.tsx
type nul > src\components\workflow\designer\nodes\AgentNode.tsx
type nul > src\components\workflow\designer\nodes\ConditionNode.tsx
mkdir src\components\workflow\tabs
type nul > src\components\workflow\tabs\DesignerTab.tsx
type nul > src\components\workflow\tabs\CodeTab.tsx
type nul > src\components\workflow\tabs\PreviewTab.tsx
type nul > src\components\workflow\tabs\ExecuteTab.tsx
mkdir src\components\workflow\execution
type nul > src\components\workflow\execution\ExecutionControls.tsx
type nul > src\components\workflow\execution\ExecutionHistory.tsx
type nul > src\components\workflow\execution\HumanTaskForm.tsx
mkdir src\components\workflow\activities
type nul > src\components\workflow\activities\ActivityList.tsx
type nul > src\components\workflow\activities\ActivityForm.tsx
mkdir src\components\workflow\agents
type nul > src\components\workflow\agents\AgentList.tsx
type nul > src\components\workflow\agents\AgentForm.tsx
mkdir src\components\workflow\rules
type nul > src\components\workflow\rules\RuleList.tsx
type nul > src\components\workflow\rules\RuleEditor.tsx
mkdir src\components\workflow\policies
type nul > src\components\workflow\policies\PolicyList.tsx
type nul > src\components\workflow\policies\PolicyEditor.tsx
mkdir src\components\ai
type nul > src\components\ai\ChatInterface.tsx
type nul > src\components\ai\WorkflowSuggestions.tsx
mkdir src\hooks
type nul > src\hooks\useWorkflow.ts
type nul > src\hooks\useActivities.ts
type nul > src\hooks\useAgents.ts
type nul > src\hooks\useRules.ts
type nul > src\hooks\usePolicies.ts
type nul > src\hooks\useAI.ts
type nul > src\hooks\useAuth.ts
type nul > src\hooks\useExecution.ts
mkdir src\store
type nul > src\store\workflowStore.ts
type nul > src\store\authStore.ts
type nul > src\store\ruleStore.ts
type nul > src\store\policyStore.ts
type nul > src\store\activityStore.ts
type nul > src\store\agentStore.ts
type nul > src\store\aiStore.ts
mkdir src\types
type nul > src\types\workflow.types.ts
type nul > src\types\activity.types.ts
type nul > src\types\agent.types.ts
type nul > src\types\rule.types.ts
type nul > src\types\policy.types.ts
type nul > src\types\auth.types.ts
type nul > src\types\ai.types.ts
mkdir src\services
type nul > src\services\api.ts
type nul > src\services\workflowService.ts
type nul > src\services\executionService.ts
type nul > src\services\activityService.ts
type nul > src\services\agentService.ts
type nul > src\services\ruleService.ts
type nul > src\services\policyService.ts
type nul > src\services\authService.ts
type nul > src\services\aiService.ts
mkdir src\utils
type nul > src\utils\workflowUtils.ts
type nul > src\utils\validationUtils.ts
type nul > src\utils\formatUtils.ts
mkdir src\context
type nul > src\context\AuthContext.tsx
mkdir src\pages
mkdir src\pages\auth
type nul > src\pages\auth\Login.tsx
type nul > src\pages\auth\Register.tsx
mkdir src\pages\workflows
type nul > src\pages\workflows\workflow.tsx
type nul > src\pages\workflows\new.tsx
type nul > src\pages\workflows\index.tsx
mkdir src\pages\activities
type nul > src\pages\activities\activity.tsx
type nul > src\pages\activities\index.tsx
mkdir src\pages\agents
type nul > src\pages\agents\agent.tsx
type nul > src\pages\agents\index.tsx
mkdir src\pages\rules
type nul > src\pages\rules\rule.tsx
type nul > src\pages\rules\index.tsx
mkdir src\pages\policies
type nul > src\pages\policies\policy.tsx
type nul > src\pages\policies\index.tsx
type nul > src\pages\index.tsx
