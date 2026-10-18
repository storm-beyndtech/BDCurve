/**
 * UI Primitives Showcase
 * Demonstrates all Bounding Curve UI components with variants
 * Use this as a reference for component usage
 */

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Chip,
  Metric,
  MetricCard,
  ThemeToggle,
} from "@/components/ui";
import {
  CreditCard,
  TrendingUp,
  Globe,
  ArrowRight,
  Check,
} from "lucide-react";

export function UIShowcase() {
  return (
    <div className="container-wide container-padding py-12 space-y-12">
      {/* Buttons Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Buttons</h2>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Marketing CTA</Button>
            <Button variant="primary-purple">Dashboard CTA</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="subtle">Subtle Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="glass">Glass Button</Button>
            <Button variant="gradient">Gradient Button</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button variant="primary" size="icon">
              <ArrowRight className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Solid background with depth shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Standard card for dashboard panels and content sections.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" hover="lift">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Apple-style elevation with hover</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                High elevation card with lift effect on hover.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Liquid glass translucent effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Translucent glass card with backdrop blur.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Badges</h2>

        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Active</Badge>
          <Badge variant="secondary">Processing</Badge>
          <Badge variant="accent">Premium</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Failed</Badge>
          <Badge variant="outline">Draft</Badge>
          <Badge variant="glass">Glass Badge</Badge>
        </div>
      </section>

      {/* Chips Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Chips</h2>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Chip variant="default">Default Chip</Chip>
            <Chip variant="primary">Marketing Tag</Chip>
            <Chip variant="accent">Dashboard Tag</Chip>
            <Chip variant="glass">Glass Chip</Chip>
            <Chip variant="outline">Outline Chip</Chip>
            <Chip variant="success" icon={<Check className="h-3 w-3"/>}>
              Verified
            </Chip>
          </div>

          <div className="flex flex-wrap gap-3">
            <Chip variant="accent" onRemove={() => console.log("Removed")}>
              Removable
            </Chip>
            <Chip variant="primary" size="sm">
              Small
            </Chip>
            <Chip variant="accent" size="lg">
              Large
            </Chip>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Metric
            label="Total Volume"
            value="$2.4M"
            change={12.5}
            changeLabel="vs last month"
            trend="up"/>

          <Metric
            label="Active Accounts"
            value="1,247"
            change={-3.2}
            changeLabel="vs last week"
            trend="down"/>

          <Metric
            label="Conversion Rate"
            value="3.42"
            suffix="%"
            change={0.8}
            changeLabel="vs yesterday"
            trend="up"/>

          <Metric
            label="Average Balance"
            value="12.5K"
            prefix="$"
            description="Per account"/>
        </div>
      </section>

      {/* Metric Cards Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Metric Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            variant="default"
            icon={<CreditCard className="h-5 w-5"/>}
            label="Card Transactions"
            value="8,423"
            change={15.3}
            changeLabel="vs last month"
            trend="up"/>

          <MetricCard
            variant="elevated"
            icon={<TrendingUp className="h-5 w-5"/>}
            label="Revenue Growth"
            value="24.8"
            suffix="%"
            change={5.2}
            changeLabel="vs last quarter"
            trend="up"/>

          <MetricCard
            variant="glass"
            icon={<Globe className="h-5 w-5"/>}
            label="Global Reach"
            value="89"
            suffix=" countries"
            description="Active markets"/>
        </div>
      </section>

      {/* Theme Toggle Section */}
      <section className="space-y-6">
        <h2 className="text-display-md font-bold">Theme Toggle</h2>

        <div className="flex gap-4 items-center">
          <ThemeToggle/>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark modes
          </p>
        </div>
      </section>
    </div>
  );
}

