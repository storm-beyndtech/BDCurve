import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface KPIDataRow {
	label: string;
	metric: string;
	change?: number;
	status?: "up" | "down" | "neutral";
	helper?: string;
}

export interface KPIDataTableProps {
	title?: string;
	description?: string;
	rows?: KPIDataRow[];
	className?: string;
}

const sampleRows: KPIDataRow[] = [
	{ label: "Card approvals", metric: "98.4%", change: 2.1, status: "up", helper: "Fraud-screened approvals" },
	{ label: "Volume processed", metric: "$2.3M", change: 6.4, status: "up", helper: "Past 30 days" },
	{ label: "Avg. ticket", metric: "$182", change: -1.8, status: "down", helper: "Blended across currencies" },
];

function ChangeBadge({ change, status }: { change?: number; status?: KPIDataRow["status"] }) {
	if (change === undefined || status === "neutral") return <span className="text-muted-foreground">â€”</span>;

	const isPositive = status === "up" || change >= 0;
	const tint = isPositive
		? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
		: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
	const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

	return (
		<Badge variant="glass" className={cn("inline-flex items-center gap-1.5 border text-xs", tint)}>
			<Icon className="h-3.5 w-3.5" strokeWidth={2}/>
			<span>{Math.abs(change).toFixed(2)}%</span>
		</Badge>
	);
}

export function KPIDataTable({
	title = "Performance by channel",
	description = "Ready-to-drop table for dashboard KPIs",
	rows = sampleRows,
	className,
}: KPIDataTableProps) {
	return (
		<Card variant="glass" padding="lg" hover="lift" className={className}>
			<CardHeader className="p-0">
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
				<CardDescription className="text-sm">{description}</CardDescription>
			</CardHeader>
			<CardContent className="mt-6 p-0 overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-muted-foreground">
							<th className="pb-3 font-medium">Metric</th>
							<th className="pb-3 font-medium">Value</th>
							<th className="pb-3 font-medium">Change</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/80">
						{rows.map((row) => (
							<tr key={row.label} className="align-middle">
								<td className="py-3">
									<div className="flex flex-col">
										<span className="font-semibold text-foreground">{row.label}</span>
										{row.helper ? <span className="text-xs text-muted-foreground">{row.helper}</span> : null}
									</div>
								</td>
								<td className="py-3 font-semibold">{row.metric}</td>
								<td className="py-3">
									<ChangeBadge change={row.change} status={row.status}/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</CardContent>
		</Card>
	);
}


