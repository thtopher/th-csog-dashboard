/**
 * Process and Function Definitions Registry
 * All 41 process/function codes from the SOP with full names and descriptions
 */

export interface ProcessDefinition {
  code: string;
  name: string;
  description: string;
  type: 'process' | 'function';
  executiveId: string;
}

export const PROCESS_DEFINITIONS: Record<string, ProcessDefinition> = {
  // ============================================
  // CEO Functions (F-*)
  // ============================================
  'F-EOC': {
    code: 'F-EOC',
    name: 'Executive Operating Cadence',
    description: 'Company operating system, meeting rhythm, decision rights, and executive alignment',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-CAI': {
    code: 'F-CAI',
    name: 'Capital Allocation & Investment',
    description: 'Investment decisions, capital deployment strategy, and ROI tracking',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-QAD': {
    code: 'F-QAD',
    name: 'Quality Assurance & Delivery',
    description: 'Quality standards, delivery excellence, and continuous improvement',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-PEM': {
    code: 'F-PEM',
    name: 'Partnership & Ecosystem',
    description: 'Strategic partnerships, ecosystem development, and alliance management',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-SP': {
    code: 'F-SP',
    name: 'Strategic Planning',
    description: 'Long-term strategy, annual planning, and strategic initiative tracking',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-CRC': {
    code: 'F-CRC',
    name: 'Client Executive Relationships',
    description: 'C-level client relationships and strategic account oversight',
    type: 'function',
    executiveId: 'exec-ceo',
  },
  'F-CPE': {
    code: 'F-CPE',
    name: 'Community & Political Engagement',
    description: 'Community involvement, industry associations, and political engagement',
    type: 'function',
    executiveId: 'exec-ceo',
  },

  // ============================================
  // President Functions and Processes
  // ============================================
  'CF': {
    code: 'CF',
    name: 'Cash Flow Management',
    description: 'Cash position monitoring, forecasting, and liquidity management',
    type: 'process',
    executiveId: 'exec-president',
  },
  'CR': {
    code: 'CR',
    name: 'Compensation & Role Changes',
    description: 'Salary adjustments, role transitions, and compensation administration',
    type: 'process',
    executiveId: 'exec-president',
  },
  'TP': {
    code: 'TP',
    name: 'Tax Preparation & Filing',
    description: 'Tax compliance, quarterly estimates, and annual filings',
    type: 'process',
    executiveId: 'exec-president',
  },
  'EM': {
    code: 'EM',
    name: 'Expense Management',
    description: 'Expense reporting, approval workflows, and policy compliance',
    type: 'process',
    executiveId: 'exec-president',
  },
  'PA': {
    code: 'PA',
    name: 'Procurement & Vendor Approval',
    description: 'Vendor selection, procurement approvals, and purchasing controls',
    type: 'process',
    executiveId: 'exec-president',
  },
  'VM': {
    code: 'VM',
    name: 'Contractor/Vendor Management',
    description: 'Contractor relationships, vendor performance, and contract management',
    type: 'process',
    executiveId: 'exec-president',
  },
  'F-IP': {
    code: 'F-IP',
    name: 'Intellectual Property Governance',
    description: 'IP protection, patent strategy, and proprietary asset management',
    type: 'function',
    executiveId: 'exec-president',
  },
  'F-OC': {
    code: 'F-OC',
    name: 'Organizational Chart Management',
    description: 'Organization structure, reporting lines, and role definitions',
    type: 'function',
    executiveId: 'exec-president',
  },
  'F-ER': {
    code: 'F-ER',
    name: 'Enterprise Risk Management',
    description: 'Risk identification, mitigation planning, and compliance oversight',
    type: 'function',
    executiveId: 'exec-president',
  },
  'F-KM': {
    code: 'F-KM',
    name: 'Knowledge Management',
    description: 'Knowledge capture, documentation standards, and institutional memory',
    type: 'function',
    executiveId: 'exec-president',
  },

  // ============================================
  // COO Processes and Functions
  // ============================================
  'OC': {
    code: 'OC',
    name: 'Operationalizing Client Contracts',
    description: 'Contract setup, project kickoff, and operational handoff',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'WD': {
    code: 'WD',
    name: 'Website Development',
    description: 'Corporate website maintenance, updates, and digital presence',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'TM': {
    code: 'TM',
    name: 'Template Management',
    description: 'Document templates, brand standards, and content governance',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'ST': {
    code: 'ST',
    name: 'Staffing',
    description: 'Resource allocation, project staffing, and capacity planning',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'EO': {
    code: 'EO',
    name: 'Employee Onboarding',
    description: 'New hire orientation, training, and integration',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'ES': {
    code: 'ES',
    name: 'Employee Separation - Voluntary',
    description: 'Resignation handling, exit interviews, and offboarding',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'ET': {
    code: 'ET',
    name: 'Employee Separation - Involuntary',
    description: 'Termination procedures, compliance, and documentation',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'PM': {
    code: 'PM',
    name: 'Performance Management',
    description: 'Performance reviews, goal setting, and feedback cycles',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'TC': {
    code: 'TC',
    name: 'Training & Compliance',
    description: 'Required training, compliance certifications, and professional development',
    type: 'process',
    executiveId: 'exec-coo',
  },
  'F-BOM': {
    code: 'F-BOM',
    name: 'Board of Managers Facilitation',
    description: 'Board meetings, governance documentation, and member communications',
    type: 'function',
    executiveId: 'exec-coo',
  },
  'F-BI': {
    code: 'F-BI',
    name: 'Business Insurance',
    description: 'Insurance coverage, policy management, and claims handling',
    type: 'function',
    executiveId: 'exec-coo',
  },
  'F-BA': {
    code: 'F-BA',
    name: 'Benefits Administration',
    description: 'Employee benefits, enrollment, and vendor coordination',
    type: 'function',
    executiveId: 'exec-coo',
  },
  'F-EH': {
    code: 'F-EH',
    name: 'Employee Handbook',
    description: 'Policy documentation, handbook updates, and employee guidelines',
    type: 'function',
    executiveId: 'exec-coo',
  },
  'F-TLG': {
    code: 'F-TLG',
    name: 'Thought Leadership Governance',
    description: 'Content approval, publication standards, and brand voice',
    type: 'function',
    executiveId: 'exec-coo',
  },

  // ============================================
  // CFO Processes
  // ============================================
  'AR': {
    code: 'AR',
    name: 'Accounts Receivable',
    description: 'Invoice generation, collections, and aging management',
    type: 'process',
    executiveId: 'exec-cfo',
  },
  'AP': {
    code: 'AP',
    name: 'Accounts Payable',
    description: 'Vendor payments, invoice processing, and payment scheduling',
    type: 'process',
    executiveId: 'exec-cfo',
  },
  'MC': {
    code: 'MC',
    name: 'Month-End Close',
    description: 'Financial close procedures, reconciliations, and reporting',
    type: 'process',
    executiveId: 'exec-cfo',
  },
  'FR': {
    code: 'FR',
    name: 'Financial Reporting',
    description: 'Financial statements, management reports, and analysis',
    type: 'process',
    executiveId: 'exec-cfo',
  },
  'IM': {
    code: 'IM',
    name: 'Inventory Management',
    description: 'Asset tracking, inventory controls, and depreciation',
    type: 'process',
    executiveId: 'exec-cfo',
  },
  'SM': {
    code: 'SM',
    name: 'SaaS Subscription Management',
    description: 'Software subscriptions, license tracking, and renewals',
    type: 'process',
    executiveId: 'exec-cfo',
  },

  // ============================================
  // CDAO Processes and Functions
  // ============================================
  'SA': {
    code: 'SA',
    name: 'Starset Analytics',
    description: 'Data analytics platform, reporting, and business intelligence',
    type: 'process',
    executiveId: 'exec-cdao',
  },
  'HMRF': {
    code: 'HMRF',
    name: 'Hospital MRF Database',
    description: 'Healthcare pricing transparency data management and analysis',
    type: 'process',
    executiveId: 'exec-cdao',
  },
  'DDD': {
    code: 'DDD',
    name: 'Data-Driven Deliverables',
    description: 'Client data products, analytics deliverables, and visualization',
    type: 'process',
    executiveId: 'exec-cdao',
  },
  'IAM': {
    code: 'IAM',
    name: 'Identity & Access Management',
    description: 'User provisioning, access controls, and security compliance',
    type: 'process',
    executiveId: 'exec-cdao',
  },
  'F-IT': {
    code: 'F-IT',
    name: 'Information Technology',
    description: 'IT infrastructure, systems administration, and technical support',
    type: 'function',
    executiveId: 'exec-cdao',
  },

  // ============================================
  // CGO Processes
  // ============================================
  'BD': {
    code: 'BD',
    name: 'Business Development',
    description: 'Lead generation, opportunity qualification, and proposal development',
    type: 'process',
    executiveId: 'exec-cgo',
  },
  'TL': {
    code: 'TL',
    name: 'Thought Leadership',
    description: 'Industry insights, publications, and speaking engagements',
    type: 'process',
    executiveId: 'exec-cgo',
  },
  'MKT': {
    code: 'MKT',
    name: 'Marketing Collateral',
    description: 'Marketing materials, brand assets, and promotional content',
    type: 'process',
    executiveId: 'exec-cgo',
  },

  // ============================================
  // CSO Processes and Functions
  // ============================================
  'SD': {
    code: 'SD',
    name: 'Service Delivery',
    description: 'Engagement management, deliverable production, and client communication',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'CP': {
    code: 'CP',
    name: 'Contract Performance',
    description: 'Contract monitoring, milestone tracking, and performance metrics',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'CC': {
    code: 'CC',
    name: 'Contract Closure',
    description: 'Project closeout, final deliverables, and lessons learned',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'CiS': {
    code: 'CiS',
    name: 'Change in Scope',
    description: 'Scope changes, change orders, and contract modifications',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'CA': {
    code: 'CA',
    name: 'Corrective Action',
    description: 'Issue resolution, corrective measures, and quality improvement',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'CFP': {
    code: 'CFP',
    name: 'Client-Facing Publications',
    description: 'Client reports, presentations, and external communications',
    type: 'process',
    executiveId: 'exec-cso',
  },
  'F-CDH': {
    code: 'F-CDH',
    name: 'Client Confidentiality & Data Handling',
    description: 'Data security, confidentiality protocols, and client data governance',
    type: 'function',
    executiveId: 'exec-cso',
  },
} as const;

/**
 * Get a process definition by code
 * Handles task codes like "BD1" by parsing out the base code
 */
export function getProcessDefinition(code: string): ProcessDefinition | undefined {
  // Direct match
  if (PROCESS_DEFINITIONS[code]) {
    return PROCESS_DEFINITIONS[code];
  }

  // Try parsing task code (e.g., "BD1" -> "BD")
  const baseCodeMatch = code.match(/^([A-Z]+-?[A-Z]*)/);
  if (baseCodeMatch) {
    return PROCESS_DEFINITIONS[baseCodeMatch[1]];
  }

  return undefined;
}

/**
 * Parse a task code to get base code and task number
 * e.g., "BD1" -> { baseCode: "BD", taskNumber: 1 }
 */
export function parseTaskCode(code: string): { baseCode: string; taskNumber?: number } {
  const match = code.match(/^([A-Z]+-?[A-Z]*)(\d+)?$/);
  if (match) {
    return {
      baseCode: match[1],
      taskNumber: match[2] ? parseInt(match[2], 10) : undefined,
    };
  }
  return { baseCode: code };
}

/**
 * Get all processes for an executive
 */
export function getProcessesForExecutive(executiveId: string): ProcessDefinition[] {
  return Object.values(PROCESS_DEFINITIONS).filter(
    (def) => def.executiveId === executiveId && def.type === 'process'
  );
}

/**
 * Get all functions for an executive
 */
export function getFunctionsForExecutive(executiveId: string): ProcessDefinition[] {
  return Object.values(PROCESS_DEFINITIONS).filter(
    (def) => def.executiveId === executiveId && def.type === 'function'
  );
}
