import { NextResponse } from 'next/server';
import type { TaskListResponse, TaskWithRACI } from '@/types';

/**
 * GET /api/tasks
 *
 * Returns tasks filtered by processId.
 * Each task includes RACI assignments.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const processId = searchParams.get('processId');

  if (!processId) {
    return NextResponse.json(
      { error: 'processId query parameter is required' },
      { status: 400 }
    );
  }

  // Get tasks for the specified process
  const { tasks, process } = getTasksForProcess(processId);

  const response: TaskListResponse = {
    tasks,
    process,
    total: tasks.length,
  };

  return NextResponse.json(response);
}

function getTasksForProcess(processId: string): {
  tasks: TaskWithRACI[];
  process: {
    id: string;
    domainId: string;
    name: string;
    code: string;
    processTag: string;
    processType: 'process' | 'function';
    sopStatus: 'documented' | 'partial' | 'missing';
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
} {
  // This is mock data - would come from database in production
  const processData: Record<string, { name: string; code: string; type: 'process' | 'function'; tasks: TaskWithRACI[] }> = {
    'p-ceo-f-eoc': {
      name: 'Executive Operating Cadence',
      code: 'F-EOC',
      type: 'function',
      tasks: [
        createTask('F-EOC1', 'Own the company operating system', 'David', 'David', ['Greg', 'Jordana'], ['CSOG']),
        createTask('F-EOC2', 'Define executive meeting rhythm', 'David', 'Jordana', ['Greg'], []),
        createTask('F-EOC3', 'Establish decision rights', 'David', 'David', ['Greg', 'Jordana'], ['CSOG']),
        createTask('F-EOC4', 'Make final calls on priority conflicts', 'David', 'David', ['Greg', 'Jordana'], []),
        createTask('F-EOC5', 'Define escalation thresholds', 'David', 'CSOG', ['Greg', 'Jordana'], []),
        createTask('F-EOC6', 'Own CEO-level scorecard', 'David', 'Topher', ['CSOG'], ['Board of Managers']),
        createTask('F-EOC7', 'Follow through on commitments', 'David', 'Jordana', ['CSOG'], []),
        createTask('F-EOC8', 'Maintain decision logs', 'David', 'Jordana', ['Greg'], ['Board of Managers']),
        createTask('F-EOC9', 'Ensure department cadences roll up', 'David', 'Greg', ['Jordana'], ['CSOG']),
        createTask('F-EOC10', 'Continuously improve operating model', 'David', 'David', ['Greg', 'Jordana'], ['CSOG']),
      ],
    },
    'p-cgo-bd': {
      name: 'Business Development',
      code: 'BD',
      type: 'process',
      tasks: [
        createTask('BD1', 'Identify and qualify opportunities', 'Cheryl', 'Cheryl', ['Greg'], []),
        createTask('BD2', 'Evaluate opportunity fit', 'Cheryl', 'Cheryl', ['Greg', 'David'], []),
        createTask('BD3', 'Draft Scope of Work', 'Cheryl', 'Cheryl', ['Ashley'], []),
        createTask('BD4', 'Coordinate proposal development', 'Cheryl', 'Cheryl', ['Greg'], []),
        createTask('BD5', 'Conduct client presentations', 'Cheryl', 'Cheryl', ['David'], []),
        createTask('BD6', 'Coordinate contract review', 'Cheryl', 'Jordana', ['Greg'], []),
        createTask('BD7', 'Track pipeline status', 'Cheryl', 'Cheryl', [], ['CSOG']),
        createTask('BD8', 'Coordinate delivery handoff', 'Cheryl', 'Cheryl', ['Ashley', 'Jordana'], []),
        createTask('BD9', 'Maintain CRM records', 'Cheryl', 'Cheryl', [], ['CSOG']),
      ],
    },
    'p-cso-sd': {
      name: 'Service Delivery',
      code: 'SD',
      type: 'process',
      tasks: [
        createTask('SD1', 'Establish engagement management structure', 'Ashley', 'Engagement Lead', ['Greg'], []),
        createTask('SD2', 'Coordinate deliverable production', 'Ashley', 'Engagement Lead', ['Chris H.'], []),
        createTask('SD3', 'Manage client communication', 'Ashley', 'Engagement Lead', [], ['CSOG']),
        createTask('SD4', 'Monitor engagement health', 'Ashley', 'Ashley', ['Finance'], []),
        createTask('SD5', 'Coordinate QA review', 'Ashley', 'QA Reviewer', ['Greg'], []),
        createTask('SD6', 'Document lessons learned', 'Ashley', 'Engagement Lead', ['Jordana'], []),
        createTask('SD7', 'Coordinate engagement closeout', 'Ashley', 'Engagement Lead', ['Finance'], []),
      ],
    },
    'p-cfo-ar': {
      name: 'Accounts Receivable',
      code: 'AR',
      type: 'process',
      tasks: [
        createTask('AR1', 'Generate and issue invoices', 'Aisha', 'Finance', ['Ashley'], []),
        createTask('AR2', 'Track invoice status', 'Aisha', 'Finance', [], []),
        createTask('AR3', 'Prepare aging reports', 'Aisha', 'Finance', [], ['Greg']),
        createTask('AR4', 'Coordinate on billing questions', 'Aisha', 'Finance', ['Ashley'], []),
        createTask('AR5', 'Follow up on outstanding AR', 'Aisha', 'Finance', ['Greg'], []),
        createTask('AR6', 'Escalate delinquent accounts', 'Aisha', 'Greg', [], ['David']),
      ],
    },
    'p-pres-cf': {
      name: 'Cash Flow Management',
      code: 'CF',
      type: 'process',
      tasks: [
        createTask('CF1', 'Schedule weekly finance review', 'Greg', 'Finance', ['Jordana'], ['David']),
        createTask('CF2', 'Prepare cash position summary', 'Greg', 'Finance', ['David'], ['Jordana']),
        createTask('CF3', 'Review outstanding payables', 'Greg', 'Finance', ['David'], ['Jordana']),
        createTask('CF4', 'Review AR risks', 'Greg', 'Finance', ['David'], ['Jordana']),
        createTask('CF5', 'Identify cash constraints', 'Greg', 'Greg', ['Finance', 'David'], ['Jordana']),
        createTask('CF6', 'Update cash tracker', 'Greg', 'Jordana', ['David'], ['Finance']),
        createTask('CF7', 'Document follow-up actions', 'Greg', 'Finance', ['David'], ['Jordana']),
        createTask('CF8', 'Monitor cash position changes', 'Greg', 'Greg', ['Finance'], ['David', 'Jordana']),
      ],
    },
  };

  const data = processData[processId];

  if (!data) {
    return {
      tasks: [],
      process: {
        id: processId,
        domainId: 'd1',
        name: 'Unknown Process',
        code: 'UNK',
        processTag: 'unknown',
        processType: 'process',
        sopStatus: 'missing',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  return {
    tasks: data.tasks,
    process: {
      id: processId,
      domainId: 'd1',
      name: data.name,
      code: data.code,
      processTag: data.code.toLowerCase().replace('-', '_'),
      processType: data.type,
      sopStatus: 'documented',
      displayOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function createTask(
  code: string,
  description: string,
  accountable: string,
  responsible: string,
  contributors: string[],
  informed: string[]
): TaskWithRACI {
  return {
    id: `task-${code}`,
    processId: 'p1',
    code,
    description,
    displayOrder: parseInt(code.replace(/\D/g, '')) || 1,
    status: 'active',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accountable,
    responsible,
    contributors,
    informed,
  };
}
