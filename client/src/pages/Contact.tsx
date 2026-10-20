import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";
import { SupportCTA } from "@/components/marketing/support-cta";
import { BackgroundGrid, SubtleBlurOrbs } from "@/components/marketing/visuals";
import { MarketPanel } from "@/components/marketing/visuals";
import { Mail, MapPin, MessageCircle, Phone, Clock, Globe, BookOpen, Calendar } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/$/, "");

const contactMethods = [
	{
		icon: MessageCircle,
		title: "Live Chat",
		description: "Get instant answers",
		detail: "Available 24/7",
		color: "primary" as const,
	},
	{
		icon: Mail,
		title: "Email",
		description: "support@boundingcurve.com",
		detail: "Response within 24 hours",
		color: "accent" as const,
	},
	{
		icon: Phone,
		title: "Phone",
		description: "+1 (606) 913-4456",
		href: "tel:+16069134456",
		detail: "Mon-Fri, 9am-6pm EST",
		color: "primary" as const,
	},
];

const offices = [
	{
		city: "San Francisco",
		address: "123 Market Street, Suite 400",
		region: "United States",
	},
	{
		city: "London",
		address: "45 Finsbury Square",
		region: "United Kingdom",
	},
	{
		city: "Singapore",
		address: "1 Raffles Place, Tower 2",
		region: "Singapore",
	},
];

export default function ContactPage() {
	return (
		<div className="relative">
			{/* Background Visuals */}
			<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
				<BackgroundGrid variant="dots" cellSize={40} opacity={0.15} />
				<SubtleBlurOrbs context="marketing" />
			</div>

			{/* Hero Section */}
			<section className="py-16 sm:py-20 w-full">
				<div className="container-wide container-padding">
					<div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
					<div className="space-y-5 text-center lg:text-left">
						<Badge variant="glass" className="shadow-depth">
							Contact Us
						</Badge>

						<h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
							Let's talk about your <span className="text-primary-600">investing goals</span>
						</h1>

						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Have questions about our trading platform, features, or how Bounding Curve can help you
							invest smarter? Our team is here to help.
						</p>
					</div>
					<MarketPanel
						className="hidden sm:block"
						eyebrow="Support desk"
						value="< 1 hour"
						pill="Online"
						pillTone="positive"
						listTitle="Ways to reach us"
						rows={[
							{ label: "Email", sub: "support@boundingcurve.com", value: "24/7", icon: Mail },
							{ label: "Phone", sub: "+1 (606) 913-4456", value: "Mon–Fri", icon: Phone },
							{ label: "Live chat", sub: "From your dashboard", value: "Instant", icon: MessageCircle },
						]}
						callout={{ title: "Real people, fast answers", sub: "Average first response under an hour" }}
					/>
					</div>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="section-spacing-md w-full">
				<div className="container-wide container-padding">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{contactMethods.map((method, index) => {
							const Icon = method.icon;
							return (
								<Card key={index} variant="glass" padding="lg" hover="lift" className="text-center">
									<div className="space-y-3">
										<div
											className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
												method.color === "primary" ? "bg-primary-500/10" : "bg-accent-500/10"
											}`}
										>
											<Icon
												className={`h-6 w-6 ${
													method.color === "primary" ? "text-primary-600" : "text-accent-600"
												}`}
											/>
										</div>
										<div>
											<h3 className="font-semibold mb-1">{method.title}</h3>
											{"href" in method && method.href ? (
												<a href={method.href} className="text-sm text-foreground hover:underline">
													{method.description}
												</a>
											) : (
												<p className="text-sm text-foreground">{method.description}</p>
											)}
											<p className="text-xs text-muted-foreground mt-2">{method.detail}</p>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* Contact Form & Info */}
			<section className="section-spacing-lg bg-muted/30 w-full">
				<div className="container-wide container-padding">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Contact Form */}
						<div className="lg:col-span-2">
							<div className="mb-6">
								<h2 className="text-2xl font-bold mb-2">Send us a message</h2>
								<p className="text-muted-foreground">
									Fill out the form below and we'll get back to you within 24 hours.
								</p>
							</div>

							<ContactForm
								showCompany={true}
								showMessage={true}
								onSubmit={async (data) => {
									const response = await fetch(`${API_URL}/api/contact`, {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify(data),
									});

									if (!response.ok) {
										throw new Error("Failed to send message");
									}

									return response.json();
								}}
							/>
						</div>

						{/* Sidebar Info */}
						<div className="space-y-6">
							{/* Office Locations */}
							<Card variant="glass" padding="lg">
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<MapPin className="h-5 w-5 text-primary-600" />
										<h3 className="font-semibold">Office Locations</h3>
									</div>

									<div className="space-y-4">
										{offices.map((office, index) => (
											<div key={index} className="space-y-1">
												<p className="font-medium text-sm">{office.city}</p>
												<p className="text-xs text-muted-foreground">{office.address}</p>
												<p className="text-xs text-muted-foreground">{office.region}</p>
												{index !== offices.length - 1 && <div className="h-px bg-border mt-4" />}
											</div>
										))}
									</div>
								</div>
							</Card>

							{/* Business Hours */}
							<Card variant="glass" padding="lg">
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Clock className="h-5 w-5 text-accent-600" />
										<h3 className="font-semibold">Business Hours</h3>
									</div>

									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Monday - Friday</span>
											<span className="font-medium">9:00 AM - 6:00 PM</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Saturday</span>
											<span className="font-medium">10:00 AM - 4:00 PM</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Sunday</span>
											<span className="font-medium">Closed</span>
										</div>

										<div className="pt-2 text-xs text-muted-foreground">
											All times in EST. Support available 24/7 via live chat.
										</div>
									</div>
								</div>
							</Card>

							{/* Global Support */}
							<Card variant="glass" padding="lg">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Globe className="h-5 w-5 text-primary-600" />
										<h3 className="font-semibold">Global Support</h3>
									</div>

									<p className="text-sm text-muted-foreground">
										We support businesses in 89 countries with localized assistance in 12 languages.
									</p>

									<div className="flex flex-wrap gap-2 pt-2">
										{["English", "Spanish", "French", "German", "Chinese", "Japanese"].map((lang, index) => (
											<Badge key={index} variant="outline" className="text-xs">
												{lang}
											</Badge>
										))}
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Support CTA */}
			<section className="section-spacing-lg w-full">
				<div className="container-wide container-padding">
					<SupportCTA showAllOptions={true} variant="glass" />
				</div>
			</section>
		</div>
	);
}
