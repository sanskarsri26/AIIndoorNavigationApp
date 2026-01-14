import { useState } from "react";
import { AlertCircle, Droplets, Package, Phone } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportIssueDialog({ open, onOpenChange }: ReportIssueDialogProps) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const handleReportIssue = (issueType: string) => {
    setSelectedIssue(issueType);
    // Simulate reporting
    setTimeout(() => {
      alert(`Issue reported: ${issueType}. Store staff will be notified.`);
      onOpenChange(false);
      setSelectedIssue(null);
    }, 500);
  };

  const issues = [
    {
      id: "spill",
      title: "Report Spill",
      description: "Water, food, or other hazard on floor",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
    },
    {
      id: "out-of-stock",
      title: "Item Out of Stock",
      description: "Product is missing or unavailable",
      icon: Package,
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-400",
    },
    {
      id: "help",
      title: "Call for Help",
      description: "Request staff assistance",
      icon: Phone,
      color: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            Report an Issue
          </DialogTitle>
          <DialogDescription className="text-cyan-400/70">
            Select the type of issue you'd like to report
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {issues.map((issue) => {
            const Icon = issue.icon;
            return (
              <Button
                key={issue.id}
                variant="outline"
                className={`w-full h-auto p-4 flex items-start gap-3 bg-zinc-800 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-left transition-all ${
                  selectedIssue === issue.id ? "border-cyan-400 bg-cyan-500/20" : ""
                }`}
                onClick={() => handleReportIssue(issue.title)}
                disabled={selectedIssue !== null}
              >
                <div className={`rounded-full p-2 bg-gradient-to-br ${issue.color} shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white mb-1">{issue.title}</p>
                  <p className="text-cyan-400/70 text-xs">{issue.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-cyan-400 hover:bg-cyan-500/20"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
