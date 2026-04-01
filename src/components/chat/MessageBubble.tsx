import { useState, useEffect } from "react";
import { Bot, Shield, ShieldAlert, Clock } from "lucide-react";
import { Markdown } from "../Markdown";
import type { Message, ApprovalInfo, ApprovalEventItem } from "../../types/chat";
import { ToolCallCard } from "./ToolCallCard";

function ApprovalCountdown({ createdAt, timeoutSec }: { createdAt: number; timeoutSec: number }) {
  const [remaining, setRemaining] = useState(() => {
    const deadline = createdAt + timeoutSec;
    return Math.max(0, deadline - Math.floor(Date.now() / 1000));
  });

  useEffect(() => {
    const id = setInterval(() => {
      const deadline = createdAt + timeoutSec;
      const left = Math.max(0, deadline - Math.floor(Date.now() / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [createdAt, timeoutSec]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 30;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
      <Clock className="size-3" />
      {remaining <= 0 ? "Expired" : `${mins}:${String(secs).padStart(2, "0")}`}
    </span>
  );
}

function ApprovalBubble({ approval }: { approval: ApprovalInfo }) {
  const isBatch = approval.type === "batch" && approval.requests && approval.requests.length > 0;
  const isHighRisk = isBatch
    ? approval.requests!.some((r) => r.decision.risk === "high")
    : approval.decision.risk === "high";
  const resolved = !!approval.resolved;

  return (
    <div className={`flex gap-3 items-start ${resolved ? "opacity-50" : ""}`}>
      <div className={`flex size-7 shrink-0 items-center justify-center rounded-full mt-0.5 ${resolved ? "bg-muted" : isHighRisk ? "bg-destructive/10" : "bg-amber-500/10"}`}>
        {resolved
          ? <Shield className="size-4 text-muted-foreground" />
          : isHighRisk
            ? <ShieldAlert className="size-4 text-destructive" />
            : <Shield className="size-4 text-amber-600" />}
      </div>
      <div className={`min-w-0 flex-1 rounded-lg border p-4 shadow-sm ${resolved ? "bg-muted/50 border-border/30" : "bg-card"}`}>
        <div className="font-semibold text-sm mb-2 flex items-center justify-between">
          <span>
            {resolved
              ? (isBatch ? `Approved (${approval.requests!.length} commands)` : "Approved")
              : (isBatch ? `Approval Required (${approval.requests!.length} commands)` : "Approval Required")}
          </span>
          {!resolved && approval.created_at && approval.timeout_sec && (
            <ApprovalCountdown createdAt={approval.created_at} timeoutSec={approval.timeout_sec} />
          )}
        </div>

        {isBatch ? (
          <BatchApprovalContent requests={approval.requests!} />
        ) : (
          <SingleApprovalContent approval={approval} />
        )}

        {!resolved && (
          <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
            <div>
              <code className="text-primary">y</code> approve once
              {" · "}<code className="text-primary">s</code> approve session
              {" · "}<code className="text-primary">a</code> always
              {" · "}<code className="text-destructive">n</code> deny
            </div>
            {isBatch && (
              <div>Or enter indices: <code className="text-primary">1,3</code> or <code className="text-primary">1-3</code></div>
            )}
            <div className="italic">Add <code>//</code> for comment, e.g. <code>y // looks safe</code></div>
          </div>
        )}
      </div>
    </div>
  );
}

function SingleApprovalContent({ approval }: { approval: ApprovalInfo }) {
  const cmdText = approval.args?.cmd as string | undefined;
  return (
    <>
      <ul className="text-sm space-y-1 text-muted-foreground">
        <li><span className="font-medium">Tool:</span>{" "}<code className="bg-muted px-1.5 py-0.5 rounded text-xs">{approval.tool}</code></li>
        {approval.decision.risk && (
          <li><span className="font-medium">Risk:</span> {approval.decision.risk}</li>
        )}
        {approval.decision.reason && (
          <li><span className="font-medium">Reason:</span> {approval.decision.reason}</li>
        )}
      </ul>
      {cmdText && <CmdBlock text={cmdText} />}
    </>
  );
}

/** Show command text: up to 3 lines visible, click to expand with scroll */
function CmdBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const [expanded, setExpanded] = useState(false);
  const truncated = lines.length > 3;
  const visible = expanded || !truncated ? lines : lines.slice(0, 3);
  return (
    <div className="mt-2">
      <pre className={`bg-muted p-3 rounded text-xs font-mono overflow-auto ${expanded ? "max-h-[300px]" : ""}`}>
        {visible.map((line, i) => (
          <div key={i}><span className="text-muted-foreground mr-3 select-none">{i + 1}</span>{line}</div>
        ))}
      </pre>
      {truncated && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}

function BatchApprovalContent({ requests }: { requests: ApprovalEventItem[] }) {
  return (
    <div className="space-y-2">
      {requests.map((req, idx) => {
        const cmdText = req.args?.cmd as string | undefined;
        return (
          <div key={idx} className="border-l-2 border-primary/30 pl-3 py-1">
            <div className="text-sm flex items-start gap-1">
              <span className="font-medium text-muted-foreground shrink-0">{idx + 1}.</span>
              {!cmdText && <span className="text-muted-foreground">[{req.tool}]</span>}
              {req.decision.risk === "high" && <span className="ml-1.5 text-xs text-destructive font-medium shrink-0">HIGH</span>}
            </div>
            {cmdText && <CmdBlock text={cmdText} />}
          </div>
        );
      })}
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.approval) {
    return <ApprovalBubble approval={message.approval} />;
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
        <Bot className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {message.toolCalls.map((tc, i) => (
              <ToolCallCard key={i} tc={tc} />
            ))}
          </div>
        )}
        <div className="text-sm text-foreground leading-relaxed">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
