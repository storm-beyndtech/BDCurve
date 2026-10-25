/**
 * Visual Components Showcase
 * Demonstrates all marketing visual components
 */

import {
  BackgroundGrid,
  BackgroundGridWave,
  MarketingBlurOrbs,
  DashboardBlurOrbs,
  SubtleBlurOrbs,
  OrbitalLines,
  CompactOrbitalLines,
  LargeOrbitalLines,
  FloatingCards,
  FloatingCardStack,
  FloatingCardGrid,
} from "@/components/marketing/visuals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Globe, Zap, TrendingUp, Shield, Users } from "lucide-react";

export function VisualsShowcase() {
  return (
    <div className="space-y-24 py-12">
      {/* Background Grids */}
      <section>
        <div className="mb-8">
          <Badge variant="accent" className="mb-4">
            Background Grids
          </Badge>
          <h2 className="text-display-md font-bold mb-2">Grid Patterns</h2>
          <p className="text-muted-foreground">
            Premium grid and dot patterns for backgrounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="relative overflow-hidden h-64">
            <BackgroundGrid variant="dots" cellSize={32} opacity={0.3}/>
            <CardHeader className="relative z-10">
              <CardTitle>Dot Pattern</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Subtle dot grid for clean backgrounds
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative overflow-hidden h-64">
            <BackgroundGrid variant="lines" cellSize={48} opacity={0.2}/>
            <CardHeader className="relative z-10">
              <CardTitle>Line Pattern</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Line grid for structured layouts
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative overflow-hidden h-64">
            <BackgroundGridWave variant="dots" cellSize={32} opacity={0.25}/>
            <CardHeader className="relative z-10">
              <CardTitle>Wave Animation</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Animated grid with wave effect
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blur Orbs */}
      <section>
        <div className="mb-8">
          <Badge variant="accent" className="mb-4">
            Blur Orbs
          </Badge>
          <h2 className="text-display-md font-bold mb-2">Ambient Glows</h2>
          <p className="text-muted-foreground">
            Floating glowing orbs with brand colors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" className="relative overflow-hidden h-96">
            <MarketingBlurOrbs opacity={0.4}/>
            <CardHeader className="relative z-10">
              <CardTitle>Marketing Orbs</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-4">
                Green-based ambient glows for marketing pages
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Smooth floating animations</li>
                <li>• Multiple movement patterns</li>
                <li>• Configurable blur intensity</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative overflow-hidden h-96">
            <DashboardBlurOrbs opacity={0.4}/>
            <CardHeader className="relative z-10">
              <CardTitle>Dashboard Orbs</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-4">
                Purple-based ambient glows for dashboard
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Independent timing per orb</li>
                <li>• Low GPU usage</li>
                <li>• Auto light/dark mode</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Orbital Lines */}
      <section>
        <div className="mb-8">
          <Badge variant="accent" className="mb-4">
            Orbital Lines
          </Badge>
          <h2 className="text-display-md font-bold mb-2">Parallax Rings</h2>
          <p className="text-muted-foreground">
            Apple-like orbital rings with scroll parallax
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" className="relative overflow-hidden h-96">
            <CompactOrbitalLines parallax={false}/>
            <CardHeader className="relative z-10">
              <CardTitle>Compact Orbitals</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-4">
                Perfect for hero sections and compact spaces
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 3 orbital rings</li>
                <li>• Bidirectional rotation</li>
                <li>• SVG-based scalability</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative overflow-hidden h-96">
            <LargeOrbitalLines parallax={false}/>
            <CardHeader className="relative z-10">
              <CardTitle>Large Orbitals</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-4">
                Expansive rings for full-page backgrounds
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 4+ orbital rings</li>
                <li>• Parallax scroll effect</li>
                <li>• Subtle depth layering</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Floating Cards */}
      <section>
        <div className="mb-8">
          <Badge variant="accent" className="mb-4">
            Floating Cards
          </Badge>
          <h2 className="text-display-md font-bold mb-2">Motion Cards</h2>
          <p className="text-muted-foreground">
            Floating card elements with smooth animations
          </p>
        </div>

        <div className="space-y-6">
          {/* Scattered Cards */}
          <Card variant="elevated" className="relative overflow-hidden h-[500px]">
            <FloatingCards
              variant="glass"
              cards={[
                {
                  content: (
                    <div className="text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary-500"/>
                      <p className="text-sm font-medium">Card Issuing</p>
                    </div>
                  ),
                  x: 15,
                  y: 20,
                  width: 180,
                  height: 120,
                  duration: 6,
                },
                {
                  content: (
                    <div className="text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-accent-500"/>
                      <p className="text-sm font-medium">Global Reach</p>
                    </div>
                  ),
                  x: 70,
                  y: 15,
                  width: 180,
                  height: 120,
                  duration: 7,
                  delay: 2,
                },
                {
                  content: (
                    <div className="text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-primary-500"/>
                      <p className="text-sm font-medium">Instant Payouts</p>
                    </div>
                  ),
                  x: 45,
                  y: 60,
                  width: 180,
                  height: 120,
                  duration: 8,
                  delay: 4,
                },
              ]}/>
            <CardHeader className="relative z-10">
              <CardTitle>Scattered Layout</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Cards positioned freely across the canvas
              </p>
            </CardContent>
          </Card>

          {/* Grid Cards */}
          <Card variant="elevated" className="relative overflow-hidden h-[500px]">
            <FloatingCardGrid
              variant="glass"
              cards={[
                {
                  content: <Shield className="h-8 w-8 text-primary-500"/>,
                  x: 10,
                  y: 15,
                  width: 160,
                  height: 100,
                  duration: 5,
                },
                {
                  content: <TrendingUp className="h-8 w-8 text-accent-500"/>,
                  x: 50,
                  y: 30,
                  width: 160,
                  height: 100,
                  duration: 6,
                },
                {
                  content: <Users className="h-8 w-8 text-primary-500"/>,
                  x: 80,
                  y: 60,
                  width: 160,
                  height: 100,
                  duration: 7,
                },
                {
                  content: <Globe className="h-8 w-8 text-accent-500"/>,
                  x: 25,
                  y: 65,
                  width: 160,
                  height: 100,
                  duration: 6.5,
                },
              ]}/>
            <CardHeader className="relative z-10">
              <CardTitle>Grid Layout</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Cards arranged in a structured grid pattern
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Combined Example */}
      <section>
        <div className="mb-8">
          <Badge variant="accent" className="mb-4">
            Combined Layers
          </Badge>
          <h2 className="text-display-md font-bold mb-2">Full Stack</h2>
          <p className="text-muted-foreground">
            Multiple visual elements layered together
          </p>
        </div>

        <Card variant="elevated" className="relative overflow-hidden h-[600px]">
          {/* Background Layers */}
          <BackgroundGrid variant="dots" cellSize={32} opacity={0.2}/>
          <SubtleBlurOrbs context="marketing"/>
          <CompactOrbitalLines parallax={false}/>

          {/* Floating Cards */}
          <FloatingCards
            variant="glass"
            cards={[
              {
                content: (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary-500"/>
                    </div>
                    <p className="text-sm font-medium">Global Cards</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Issue instantly
                    </p>
                  </div>
                ),
                x: 15,
                y: 25,
                width: 200,
                height: 140,
                duration: 7,
              },
              {
                content: (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-accent-500/10 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-accent-500"/>
                    </div>
                    <p className="text-sm font-medium">89 Countries</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Worldwide reach
                    </p>
                  </div>
                ),
                x: 75,
                y: 20,
                width: 200,
                height: 140,
                duration: 8,
                delay: 2,
              },
            ]}/>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-display-lg font-bold mb-4">
              Premium Visual Stack
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Combine grid patterns, blur orbs, orbital lines, and floating
              cards to create stunning visual experiences.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}


