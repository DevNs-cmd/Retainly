export interface WorkflowNode {
  id: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'DELAY' | 'BRANCH';
  title: string;
  subtitle: string;
  icon: string;
  config: Record<string, any>;
  nextId?: string;
  alternateNextId?: string; // For IF/ELSE branch
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggerCount: number;
  successRate: number;
  lastTriggered: string;
  nodes: WorkflowNode[];
}
