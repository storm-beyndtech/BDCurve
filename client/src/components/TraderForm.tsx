import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface TraderFormData {
	name: string;
	username: string;
	bio: string;
	experience: number;
	specialization: string;
	specialties: string;
	tradingStyle: string;
	riskLevel: string;
	totalTrades: number;
	winRate: number;
	totalCopiers: number;
	profitPercentageMonthly: number;
	profitPercentageYearly: number;
	averageHoldingTime: string;
	minimumCopyAmount: number;
	copierFee: number;
	status: string;
}

interface TraderFormProps {
	trader: any | null;
	onSubmit: (formData: FormData) => Promise<void>;
	onCancel: () => void;
	loading: boolean;
}

export default function TraderForm({ trader, onSubmit, onCancel, loading }: TraderFormProps) {
	const [formData, setFormData] = useState<TraderFormData>({
		name: "",
		username: "",
		bio: "",
		experience: 1,
		specialization: "Forex",
		specialties: "",
		tradingStyle: "Day Trading",
		riskLevel: "Low",
		totalTrades: 0,
		winRate: 0,
		totalCopiers: 0,
		profitPercentageMonthly: 0,
		profitPercentageYearly: 0,
		averageHoldingTime: "1 day",
		minimumCopyAmount: 100,
		copierFee: 10,
		status: "active",
	});

	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [removeImage, setRemoveImage] = useState(false);

	useEffect(() => {
		if (trader) {
			setFormData({
				name: trader.name || "",
				username: trader.username || "",
				bio: trader.bio || "",
				experience: trader.experience || 1,
				specialization: trader.specialization || "Forex",
				specialties: Array.isArray(trader.specialties) ? trader.specialties.join(", ") : "",
				tradingStyle: trader.tradingStyle || "Day Trading",
				riskLevel: trader.riskLevel || "Low",
				totalTrades: trader.totalTrades || 0,
				winRate: trader.winRate || 0,
				totalCopiers: trader.totalCopiers || 0,
				profitPercentageMonthly: trader.profitPercentage?.monthly || 0,
				profitPercentageYearly: trader.profitPercentage?.yearly || 0,
				averageHoldingTime: trader.averageHoldingTime || "1 day",
				minimumCopyAmount: trader.minimumCopyAmount || 100,
				copierFee: trader.copierFee || 10,
				status: trader.status || "active",
			});
			setImagePreview(trader.profileImage || "");
		}
	}, [trader]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size must be less than 5MB");
				return;
			}

			setProfileImage(file);
			setRemoveImage(false);

			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setProfileImage(null);
		setImagePreview("");
		setRemoveImage(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.name.trim()) {
			toast.error("Trader name is required");
			return;
		}
		if (!formData.username.trim()) {
			toast.error("Username is required");
			return;
		}
		if (!formData.bio.trim()) {
			toast.error("Bio is required");
			return;
		}
		if (formData.bio.length > 500) {
			toast.error("Bio cannot exceed 500 characters");
			return;
		}
		if (formData.winRate < 0 || formData.winRate > 100) {
			toast.error("Win rate must be between 0 and 100");
			return;
		}
		if (formData.copierFee < 0 || formData.copierFee > 100) {
			toast.error("Copier fee must be between 0 and 100");
			return;
		}

		const submitData = new FormData();
		submitData.append("name", formData.name);
		submitData.append("username", formData.username.toLowerCase());
		submitData.append("bio", formData.bio);
		submitData.append("experience", String(formData.experience));
		submitData.append("specialization", formData.specialization);
		submitData.append("specialties", formData.specialties);
		submitData.append("tradingStyle", formData.tradingStyle);
		submitData.append("riskLevel", formData.riskLevel);
		submitData.append("totalTrades", String(formData.totalTrades));
		submitData.append("winRate", String(formData.winRate));
		submitData.append("totalCopiers", String(formData.totalCopiers));
		submitData.append("profitPercentage[monthly]", String(formData.profitPercentageMonthly));
		submitData.append("profitPercentage[yearly]", String(formData.profitPercentageYearly));
		submitData.append("averageHoldingTime", formData.averageHoldingTime);
		submitData.append("minimumCopyAmount", String(formData.minimumCopyAmount));
		submitData.append("copierFee", String(formData.copierFee));
		submitData.append("status", formData.status);

		if (profileImage) {
			submitData.append("profileImage", profileImage);
		} else if (removeImage) {
			submitData.append("removeImage", "true");
		}

		await onSubmit(submitData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Basic Information */}
			<Card variant="glass" padding="lg">
				<h3 className="text-lg font-semibold mb-4">Basic Information</h3>
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="name">Trader Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="John Doe"
							/>
						</div>
						<div>
							<Label htmlFor="username">Username *</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
								placeholder="johndoe"
							/>
						</div>
					</div>

					{/* Profile Image */}
					<div>
						<Label>Profile Image</Label>
						<div className="mt-2">
							{imagePreview ? (
								<div className="relative inline-block">
									<img
										src={imagePreview}
										alt="Preview"
										className="w-32 h-32 rounded-lg object-cover border border-border"
									/>
									<button
										type="button"
										onClick={handleRemoveImage}
										className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							) : (
								<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/5">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
										<p className="text-sm text-muted-foreground">Click to upload image</p>
										<p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB)</p>
									</div>
									<input
										type="file"
										className="hidden"
										accept="image/jpeg,image/jpg,image/png,image/webp"
										onChange={handleImageChange}
									/>
								</label>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="bio">Bio * (max 500 characters)</Label>
						<textarea
							id="bio"
							value={formData.bio}
							onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
							placeholder="Professional trader with 5 years of experience..."
							className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							maxLength={500}
						/>
						<p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500</p>
					</div>

					<div>
						<Label htmlFor="experience">Experience (years) *</Label>
						<Input
							id="experience"
							type="number"
							min="1"
							value={formData.experience}
							onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
						/>
					</div>
				</div>
			</Card>

			{/* Trading Profile */}
			<Card variant="glass" padding="lg">
				<h3 className="text-lg font-semibold mb-4">Trading Profile</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<Label htmlFor="totalTrades">Total Trades</Label>
						<Input
							id="totalTrades"
							type="number"
							min="0"
							value={formData.totalTrades}
							onChange={(e) => setFormData({ ...formData, totalTrades: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="specialization">Specialization *</Label>
						<select
							id="specialization"
							value={formData.specialization}
							onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="Forex">Forex</option>
							<option value="Crypto">Crypto</option>
							<option value="Stocks">Stocks</option>
							<option value="Commodities">Commodities</option>
							<option value="Options">Options</option>
							<option value="Indices">Indices</option>
							<option value="Mixed">Mixed</option>
						</select>
					</div>

					<div>
						<Label htmlFor="specialties">Specialties (comma separated)</Label>
						<Input
							id="specialties"
							placeholder="e.g. Crypto swing, DeFi yield"
							value={formData.specialties}
							onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
						/>
					</div>

					<div>
						<Label htmlFor="tradingStyle">Trading Style *</Label>
						<select
							id="tradingStyle"
							value={formData.tradingStyle}
							onChange={(e) => setFormData({ ...formData, tradingStyle: e.target.value })}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="Day Trading">Day Trading</option>
							<option value="Swing Trading">Swing Trading</option>
							<option value="Position Trading">Position Trading</option>
							<option value="Scalping">Scalping</option>
						</select>
					</div>

					<div>
						<Label htmlFor="riskLevel">Risk Level *</Label>
						<select
							id="riskLevel"
							value={formData.riskLevel}
							onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="Low">Low</option>
							<option value="Medium">Medium</option>
							<option value="High">High</option>
						</select>
					</div>

					<div>
						<Label htmlFor="averageHoldingTime">Average Holding Time</Label>
						<Input
							id="averageHoldingTime"
							value={formData.averageHoldingTime}
							onChange={(e) => setFormData({ ...formData, averageHoldingTime: e.target.value })}
							placeholder="e.g., 2 days, 4 hours"
						/>
					</div>
				</div>
			</Card>

			{/* Performance Metrics */}
			<Card variant="glass" padding="lg">
				<h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<Label htmlFor="monthlyProfit">Monthly Profit (%)</Label>
						<Input
							id="monthlyProfit"
							type="number"
							step="0.01"
							value={formData.profitPercentageMonthly}
							onChange={(e) => setFormData({ ...formData, profitPercentageMonthly: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="yearlyProfit">Yearly Profit (%)</Label>
						<Input
							id="yearlyProfit"
							type="number"
							step="0.01"
							value={formData.profitPercentageYearly}
							onChange={(e) => setFormData({ ...formData, profitPercentageYearly: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="winRate">Win Rate (%) *</Label>
						<Input
							id="winRate"
							type="number"
							min="0"
							max="100"
							step="0.01"
							value={formData.winRate}
							onChange={(e) => setFormData({ ...formData, winRate: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="totalCopiers">Total Copiers</Label>
						<Input
							id="totalCopiers"
							type="number"
							min="0"
							value={formData.totalCopiers}
							onChange={(e) => setFormData({ ...formData, totalCopiers: Number(e.target.value) })}
						/>
					</div>
				</div>
			</Card>

			{/* Copy Settings */}
			<Card variant="glass" padding="lg">
				<h3 className="text-lg font-semibold mb-4">Copy Settings</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<Label htmlFor="minimumCopyAmount">Minimum Copy Amount ($) *</Label>
						<Input
							id="minimumCopyAmount"
							type="number"
							min="0"
							step="0.01"
							value={formData.minimumCopyAmount}
							onChange={(e) => setFormData({ ...formData, minimumCopyAmount: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="copierFee">Copier Fee (%) *</Label>
						<Input
							id="copierFee"
							type="number"
							min="0"
							max="100"
							step="0.01"
							value={formData.copierFee}
							onChange={(e) => setFormData({ ...formData, copierFee: Number(e.target.value) })}
						/>
					</div>

					<div>
						<Label htmlFor="status">Status *</Label>
						<select
							id="status"
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value })}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="active">Active</option>
							<option value="paused">Paused</option>
							<option value="terminated">Terminated</option>
						</select>
					</div>
				</div>
			</Card>

			{/* Action Buttons */}
			<div className="flex gap-3 justify-end">
				<Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
					Cancel
				</Button>
				<Button type="submit" variant="primary-purple" disabled={loading}>
					{loading ? "Saving..." : trader ? "Update Trader" : "Create Trader"}
				</Button>
			</div>
		</form>
	);
}
