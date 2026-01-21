'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { getProcessDefinition, parseTaskCode } from '@/config/processDefinitions';
import { cn } from '@/lib/utils/cn';

interface CodeTooltipProps {
  /** The code to look up (e.g., "BD", "F-EOC", "BD1") */
  code: string;
  /** The content to wrap with the tooltip */
  children: React.ReactNode;
  /** Additional class names for the wrapper */
  className?: string;
  /** Whether to show as inline element */
  asChild?: boolean;
}

/**
 * CodeTooltip - Wraps any element to show process/function definition on hover
 *
 * Usage:
 * <CodeTooltip code="BD">
 *   <span>BD</span>
 * </CodeTooltip>
 */
export function CodeTooltip({ code, children, className, asChild = false }: CodeTooltipProps) {
  const { baseCode, taskNumber } = parseTaskCode(code);
  const definition = getProcessDefinition(baseCode);

  // If no definition found, just render children
  if (!definition) {
    return <>{children}</>;
  }

  const tooltipContent = taskNumber
    ? `${definition.name} - Task ${taskNumber}`
    : definition.name;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild={asChild} className={cn('cursor-help', className)}>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
            sideOffset={5}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-mono font-bold',
                  definition.type === 'function' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                )}>
                  {code}
                </span>
                <span className="text-xs text-gray-400 capitalize">{definition.type}</span>
              </div>
              <p className="font-medium text-sm text-gray-900">{tooltipContent}</p>
              <p className="text-xs text-gray-500">{definition.description}</p>
            </div>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

interface SourceTooltipProps {
  /** Source text that may contain process codes (e.g., "BD Process", "CF, AR Processes") */
  source: string;
  /** Additional class names */
  className?: string;
}

/**
 * SourceTooltip - Parses a source string and wraps recognized codes with tooltips
 *
 * Usage:
 * <SourceTooltip source="BD Process" />
 * <SourceTooltip source="CF, AR Processes" />
 */
export function SourceTooltip({ source, className }: SourceTooltipProps) {
  // Extract process codes from the source string
  const codePattern = /([A-Z]+-?[A-Z]+)/g;
  const matches = source.match(codePattern);

  if (!matches || matches.length === 0) {
    return <span className={className}>{source}</span>;
  }

  // Check which codes have definitions
  const codesWithDefinitions = matches.filter(code => getProcessDefinition(code));

  if (codesWithDefinitions.length === 0) {
    return <span className={className}>{source}</span>;
  }

  // Build tooltip content for all recognized codes
  const definitions = codesWithDefinitions
    .map(code => getProcessDefinition(code))
    .filter(Boolean);

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger className={cn('cursor-help underline decoration-dotted underline-offset-2', className)}>
          {source}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-sm rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
            sideOffset={5}
          >
            <div className="space-y-2">
              {definitions.map((def) => (
                <div key={def!.code} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-mono font-bold',
                      def!.type === 'function' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {def!.code}
                    </span>
                    <span className="font-medium text-sm text-gray-900">{def!.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-0.5">{def!.description}</p>
                </div>
              ))}
            </div>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
