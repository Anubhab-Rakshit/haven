import React from 'react';
import { EscrowState } from '../types/escrow';
import { Check, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface StateTimelineProps {
  state: EscrowState;
  compact?: boolean;
}

interface StepDef {
  key: string;
  stateVal: EscrowState;
  label: string;
  color: string;
}

const LINEAR_STEPS: StepDef[] = [
  { key: 'created', stateVal: EscrowState.Created, label: 'Created', color: 'var(--accent-gold)' },
  { key: 'funded', stateVal: EscrowState.Funded, label: 'Funded', color: 'var(--accent-emerald)' },
  { key: 'delivered', stateVal: EscrowState.Delivered, label: 'Delivered', color: 'var(--accent-violet)' },
  { key: 'released', stateVal: EscrowState.Released, label: 'Released', color: 'var(--accent-emerald)' },
];

export const StateTimeline: React.FC<StateTimelineProps> = ({ state, compact = false }) => {
  const isCancelled = state === EscrowState.Cancelled;
  const isDisputed = state === EscrowState.Disputed;
  const isResolved = state === EscrowState.Resolved;

  // Determine current active linear index (0 to 3)
  let activeLinearIndex = 0;
  if (state === EscrowState.Funded) activeLinearIndex = 1;
  if (state === EscrowState.Delivered) activeLinearIndex = 2;
  if (state === EscrowState.Released) activeLinearIndex = 3;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isCancelled ? (
          <span className="badge-state cancelled" style={{ fontSize: '8px', padding: '1px 6px' }}>
            <X size={10} /> Cancelled
          </span>
        ) : isDisputed ? (
          <span className="badge-state disputed" style={{ fontSize: '8px', padding: '1px 6px' }}>
            <AlertTriangle size={10} /> In Dispute
          </span>
        ) : isResolved ? (
          <span className="badge-state resolved" style={{ fontSize: '8px', padding: '1px 6px' }}>
            <ShieldCheck size={10} /> Resolved
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {LINEAR_STEPS.map((step, idx) => {
              const isPast = idx < activeLinearIndex;
              const isCurrent = idx === activeLinearIndex;

              return (
                <React.Fragment key={step.key}>
                  <div
                    title={`${step.label} ${isCurrent ? '(Current)' : isPast ? '(Completed)' : ''}`}
                    style={{
                      width: isCurrent ? '8px' : '6px',
                      height: isCurrent ? '8px' : '6px',
                      borderRadius: '50%',
                      background: isPast || isCurrent ? step.color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isCurrent ? `0 0 8px ${step.color}` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  {idx < LINEAR_STEPS.length - 1 && (
                    <div
                      style={{
                        width: '10px',
                        height: '1px',
                        background: idx < activeLinearIndex ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full Timeline
  return (
    <div style={{ width: '100%', padding: '0.5rem 0' }}>
      {/* If Special Branch (Disputed / Resolved / Cancelled) */}
      {isDisputed || isResolved || isCancelled ? (
        <div
          style={{
            padding: '1rem',
            background: isDisputed
              ? 'rgba(255, 80, 80, 0.05)'
              : isResolved
              ? 'rgba(194, 168, 120, 0.05)'
              : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${
              isDisputed
                ? 'rgba(255, 80, 80, 0.25)'
                : isResolved
                ? 'rgba(194, 168, 120, 0.25)'
                : 'rgba(255, 255, 255, 0.08)'
            }`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDisputed && <AlertTriangle size={18} color="var(--accent-crimson)" />}
            {isResolved && <ShieldCheck size={18} color="var(--accent-gold)" />}
            {isCancelled && <X size={18} color="var(--text-muted)" />}

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: isDisputed
                    ? 'var(--accent-crimson)'
                    : isResolved
                    ? 'var(--accent-gold)'
                    : 'var(--text-muted)',
                }}
              >
                {isDisputed ? 'Escrow Disputed' : isResolved ? 'Dispute Resolved' : 'Escrow Cancelled'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}
              >
                {isDisputed
                  ? 'Condition fulfillment in dispute. Midnight arbitrator reviewing cryptographic witnesses.'
                  : isResolved
                  ? 'Arbitrator consensus reached. Escrow resolved successfully.'
                  : 'Escrow terminated prior to funding. No transfer occurred.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Normal 4-Phase Progress Flow */
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {LINEAR_STEPS.map((step, idx) => {
            const isCompleted = idx < activeLinearIndex;
            const isCurrent = idx === activeLinearIndex;

            return (
              <React.Fragment key={step.key}>
                {/* Step Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', zIndex: 2 }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'rgba(52, 211, 153, 0.15)'
                        : isCurrent
                        ? 'var(--bg-void)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1.5px solid ${
                        isCompleted
                          ? 'var(--accent-emerald)'
                          : isCurrent
                          ? step.color
                          : 'rgba(255, 255, 255, 0.12)'
                      }`,
                      boxShadow: isCurrent ? `0 0 15px ${step.color}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted ? 'var(--accent-emerald)' : isCurrent ? step.color : 'var(--text-dim)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCompleted ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: step.color,
                          boxShadow: `0 0 8px ${step.color}`,
                        }}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>{idx + 1}</span>
                    )}
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: isCurrent ? step.color : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx < LINEAR_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background: idx < activeLinearIndex ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                      margin: '0 8px',
                      position: 'relative',
                      top: '-10px',
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
