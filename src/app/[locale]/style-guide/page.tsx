"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Checkbox,
  RadioGroup,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
  CircularProgress,
  Spinner,
  Tooltip,
  AnimatedComponent,
  FadeIn,
  SlideInUp,
  ValidatedInput,
  ValidatedTextarea,
  FormField,
  FormGroup,
  FormSection,
  FormActions,
  ValidationMessage,
} from "@/components/design-system";
import Logo from "@/components/Logo";

export default function StyleGuidePage() {
  const [showCode, setShowCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [progressValue, setProgressValue] = useState(65);

  const CodeBlock = ({ code, title }: { code: string; title: string }) => (
    <div className="mt-4">
      <button
        onClick={() => setShowCode(showCode === title ? null : title)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {showCode === title ? "Hide" : "Show"} Code
      </button>
      {showCode === title && (
        <pre className="mt-2 p-4 bg-popover text-popover-foreground rounded-lg overflow-x-auto text-sm">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="md" showText={false} clickable={false} />
              <div>
                <h1 className="text-h1 text-foreground">Design System</h1>
                <p className="text-body-lg text-foreground-secondary mt-2">
                  Comprehensive style guide and component library for HELOC
                  Accelerator
                </p>
              </div>
            </div>
            {/* Theme toggle will be added later */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
            <CardDescription>
              Navigate through the design system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="#logo" className="text-primary hover:text-primary-hover">
                Logo
              </a>
              <a
                href="#colors"
                className="text-primary hover:text-primary-hover"
              >
                Colors
              </a>
              <a
                href="#typography"
                className="text-primary hover:text-primary-hover"
              >
                Typography
              </a>
              <a
                href="#spacing"
                className="text-primary hover:text-primary-hover"
              >
                Spacing
              </a>
              <a
                href="#buttons"
                className="text-primary hover:text-primary-hover"
              >
                Buttons
              </a>
              <a
                href="#forms"
                className="text-primary hover:text-primary-hover"
              >
                Form Elements
              </a>
              <a
                href="#advanced-forms"
                className="text-primary hover:text-primary-hover"
              >
                Advanced Forms
              </a>
              <a
                href="#cards"
                className="text-primary hover:text-primary-hover"
              >
                Cards
              </a>
              <a
                href="#badges"
                className="text-primary hover:text-primary-hover"
              >
                Badges
              </a>
              <a
                href="#alerts"
                className="text-primary hover:text-primary-hover"
              >
                Alerts
              </a>
              <a
                href="#modals"
                className="text-primary hover:text-primary-hover"
              >
                Modals
              </a>
              <a
                href="#dropdowns"
                className="text-primary hover:text-primary-hover"
              >
                Dropdowns
              </a>
              <a href="#tabs" className="text-primary hover:text-primary-hover">
                Tabs
              </a>
              <a
                href="#progress"
                className="text-primary hover:text-primary-hover"
              >
                Progress
              </a>
              <a
                href="#tooltips"
                className="text-primary hover:text-primary-hover"
              >
                Tooltips
              </a>
              <a
                href="#animations"
                className="text-primary hover:text-primary-hover"
              >
                Animations
              </a>
              <a
                href="#theme"
                className="text-primary hover:text-primary-hover"
              >
                Dark Mode
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Logo Section */}
        <section id="logo" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Logo</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Logo Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Logo Variants</CardTitle>
                <CardDescription>
                  Different logo styles for various contexts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-body font-medium mb-3">Default Logo</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo
                        variant="default"
                        size="lg"
                        showText={false}
                        clickable={false}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">
                      Logo with Text
                    </h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo
                        variant="default"
                        size="md"
                        showText={true}
                        clickable={false}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">
                      White Logo (on dark background)
                    </h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo
                        variant="white"
                        size="lg"
                        showText={false}
                        clickable={false}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Logo Sizes</CardTitle>
                <CardDescription>
                  Different logo sizes for various use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-body font-medium mb-3">Small (32px)</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo size="sm" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">
                      Medium (48px)
                    </h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo size="md" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">Large (64px)</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo size="lg" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">
                      Extra Large (96px)
                    </h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <Logo size="xl" showText={false} clickable={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <CodeBlock
            title="Logo Usage"
            code={`// Basic logo
<Logo />

// Logo with text
<Logo showText={true} />

// Different sizes
<Logo size="sm" />
<Logo size="md" />
<Logo size="lg" />
<Logo size="xl" />

// Different variants
<Logo variant="default" />
<Logo variant="white" />
<Logo variant="dark" />

// Non-clickable logo
<Logo clickable={false} />

// Priority loading (for above-the-fold)
<Logo priority={true} />`}
          />
        </section>

        {/* Colors Section */}
        <section id="colors" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Colors</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
                <CardDescription>
                  Blue-gray palette from brand identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      name: "Primary 50",
                      value: "#f0f4f8",
                      class: "bg-primary-50",
                      rgb: "240, 244, 248",
                    },
                    {
                      name: "Primary 100",
                      value: "#d9e2ec",
                      class: "bg-primary-100",
                      rgb: "217, 226, 236",
                    },
                    {
                      name: "Primary 200",
                      value: "#bcccdc",
                      class: "bg-primary-200",
                      rgb: "188, 204, 220",
                    },
                    {
                      name: "Primary 300",
                      value: "#9fb3c8",
                      class: "bg-primary-300",
                      rgb: "159, 179, 200",
                    },
                    {
                      name: "Primary 400",
                      value: "#829ab1",
                      class: "bg-primary-400",
                      rgb: "130, 154, 177",
                    },
                    {
                      name: "Primary 500 (Brand)",
                      value: "#8095af",
                      class: "bg-primary-500",
                      rgb: "128, 149, 175",
                    },
                    {
                      name: "Primary 600",
                      value: "#627d98",
                      class: "bg-primary-600",
                      rgb: "98, 125, 152",
                    },
                    {
                      name: "Primary 700",
                      value: "#486581",
                      class: "bg-primary-700",
                      rgb: "72, 101, 129",
                    },
                    {
                      name: "Primary 800",
                      value: "#334e68",
                      class: "bg-primary-800",
                      rgb: "51, 78, 104",
                    },
                    {
                      name: "Primary 900 (Navy)",
                      value: "#00193f",
                      class: "bg-primary-900",
                      rgb: "0, 25, 63",
                    },
                  ].map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg border border-border shadow-sm`}
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-body-sm font-medium text-foreground">
                          {color.name}
                        </div>
                        <div className="text-caption text-foreground-muted">
                          {color.value}
                        </div>
                        <div className="text-caption text-foreground-tertiary">
                          RGB: {color.rgb}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Secondary Colors</CardTitle>
                <CardDescription>Coral/orange accent palette</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      name: "Secondary 50",
                      value: "#fff5f0",
                      class: "bg-secondary-50",
                      rgb: "255, 245, 240",
                    },
                    {
                      name: "Secondary 100",
                      value: "#ffe4d9",
                      class: "bg-secondary-100",
                      rgb: "255, 228, 217",
                    },
                    {
                      name: "Secondary 200",
                      value: "#ffc9b4",
                      class: "bg-secondary-200",
                      rgb: "255, 201, 180",
                    },
                    {
                      name: "Secondary 300 (Primary Accent)",
                      value: "#ffac89",
                      class: "bg-secondary-300",
                      rgb: "255, 172, 137",
                    },
                    {
                      name: "Secondary 400",
                      value: "#ff8b66",
                      class: "bg-secondary-400",
                      rgb: "255, 139, 102",
                    },
                    {
                      name: "Secondary 500",
                      value: "#ff6b42",
                      class: "bg-secondary-500",
                      rgb: "255, 107, 66",
                    },
                    {
                      name: "Secondary 600",
                      value: "#d94f2a",
                      class: "bg-secondary-600",
                      rgb: "217, 79, 42",
                    },
                    {
                      name: "Secondary 700",
                      value: "#b33818",
                      class: "bg-secondary-700",
                      rgb: "179, 56, 24",
                    },
                    {
                      name: "Secondary 800",
                      value: "#8c2a0f",
                      class: "bg-secondary-800",
                      rgb: "140, 42, 15",
                    },
                    {
                      name: "Secondary 900 (Deep Brown)",
                      value: "#7f433a",
                      class: "bg-secondary-900",
                      rgb: "127, 67, 58",
                    },
                  ].map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg border border-border shadow-sm`}
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-body-sm font-medium text-foreground">
                          {color.name}
                        </div>
                        <div className="text-caption text-foreground-muted">
                          {color.value}
                        </div>
                        <div className="text-caption text-foreground-tertiary">
                          RGB: {color.rgb}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Neutral Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Neutral Colors</CardTitle>
                <CardDescription>
                  Grayscale palette for text and backgrounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      name: "Neutral 50 (Off-white)",
                      value: "#fffefe",
                      class: "bg-neutral-50",
                      rgb: "255, 254, 254",
                    },
                    {
                      name: "Neutral 100 (Light Gray)",
                      value: "#f8f9fa",
                      class: "bg-neutral-100",
                      rgb: "248, 249, 250",
                    },
                    {
                      name: "Neutral 200 (Borders)",
                      value: "#e9ecef",
                      class: "bg-neutral-200",
                      rgb: "233, 236, 239",
                    },
                    {
                      name: "Neutral 300 (Dividers)",
                      value: "#dee2e6",
                      class: "bg-neutral-300",
                      rgb: "222, 226, 230",
                    },
                    {
                      name: "Neutral 400 (Disabled)",
                      value: "#ced4da",
                      class: "bg-neutral-400",
                      rgb: "206, 212, 218",
                    },
                    {
                      name: "Neutral 500 (Placeholder)",
                      value: "#adb5bd",
                      class: "bg-neutral-500",
                      rgb: "173, 181, 189",
                    },
                    {
                      name: "Neutral 600 (Secondary Text)",
                      value: "#80828e",
                      class: "bg-neutral-600",
                      rgb: "128, 130, 142",
                    },
                    {
                      name: "Neutral 700 (Body Text)",
                      value: "#495057",
                      class: "bg-neutral-700",
                      rgb: "73, 80, 87",
                    },
                    {
                      name: "Neutral 800 (Headers)",
                      value: "#343a40",
                      class: "bg-neutral-800",
                      rgb: "52, 58, 64",
                    },
                    {
                      name: "Neutral 900 (Primary Text)",
                      value: "#212529",
                      class: "bg-neutral-900",
                      rgb: "33, 37, 41",
                    },
                  ].map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg border border-border shadow-sm`}
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-body-sm font-medium text-foreground">
                          {color.name}
                        </div>
                        <div className="text-caption text-foreground-muted">
                          {color.value}
                        </div>
                        <div className="text-caption text-foreground-tertiary">
                          RGB: {color.rgb}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Semantic Colors */}
          <div className="mt-8">
            <h3 className="text-h3 text-foreground mb-6">Semantic Colors</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* State Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>State Colors</CardTitle>
                  <CardDescription>
                    Colors for success, warning, error, and info states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Success",
                        value: "#10b981",
                        description: "Positive outcomes, confirmations",
                        rgb: "16, 185, 129",
                      },
                      {
                        name: "Warning",
                        value: "#f59e0b",
                        description: "Cautions, important notices",
                        rgb: "245, 158, 11",
                      },
                      {
                        name: "Error",
                        value: "#ef4444",
                        description: "Errors, destructive actions",
                        rgb: "239, 68, 68",
                      },
                      {
                        name: "Info",
                        value: "#3b82f6",
                        description: "Information, neutral notices",
                        rgb: "59, 130, 246",
                      },
                    ].map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center space-x-4"
                      >
                        <div
                          className={`w-16 h-12 rounded-lg border border-border shadow-sm`}
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-body font-medium text-foreground">
                            {color.name}
                          </div>
                          <div className="text-body-sm text-foreground-secondary">
                            {color.description}
                          </div>
                          <div className="text-caption text-foreground-muted">
                            {color.value} • RGB: {color.rgb}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Colors</CardTitle>
                  <CardDescription>
                    Colors for financial data visualization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Income",
                        value: "#10b981",
                        description: "Positive cash flow, earnings",
                        rgb: "16, 185, 129",
                      },
                      {
                        name: "Expense",
                        value: "#ef4444",
                        description: "Outgoing payments, costs",
                        rgb: "239, 68, 68",
                      },
                      {
                        name: "Savings",
                        value: "#8095af",
                        description: "Accumulated funds, investments",
                        rgb: "128, 149, 175",
                      },
                      {
                        name: "Debt",
                        value: "#f59e0b",
                        description: "Outstanding balances, loans",
                        rgb: "245, 158, 11",
                      },
                    ].map((color) => (
                      <div
                        key={color.name}
                        className="flex items-center space-x-4"
                      >
                        <div
                          className={`w-16 h-12 rounded-lg border border-border shadow-sm`}
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-body font-medium text-foreground">
                            {color.name}
                          </div>
                          <div className="text-body-sm text-foreground-secondary">
                            {color.description}
                          </div>
                          <div className="text-caption text-foreground-muted">
                            {color.value} • RGB: {color.rgb}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chart Colors */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Chart Colors</CardTitle>
                <CardDescription>
                  Color palette for data visualization and charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {[
                    {
                      name: "Chart Primary",
                      value: "#8095af",
                      rgb: "128, 149, 175",
                    },
                    {
                      name: "Chart Secondary",
                      value: "#ffac89",
                      rgb: "255, 172, 137",
                    },
                    {
                      name: "Chart Tertiary",
                      value: "#f59e0b",
                      rgb: "245, 158, 11",
                    },
                    {
                      name: "Chart Quaternary",
                      value: "#3b82f6",
                      rgb: "59, 130, 246",
                    },
                    {
                      name: "Chart Quinary",
                      value: "#ec4899",
                      rgb: "236, 72, 153",
                    },
                  ].map((color) => (
                    <div key={color.name} className="text-center">
                      <div
                        className="w-20 h-20 rounded-lg border border-border shadow-sm mb-2"
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <div className="text-body-sm font-medium text-foreground">
                        {color.name}
                      </div>
                      <div className="text-caption text-foreground-muted">
                        {color.value}
                      </div>
                      <div className="text-caption text-foreground-tertiary">
                        RGB: {color.rgb}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Examples */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Color Usage Examples</CardTitle>
                <CardDescription>
                  How to use brand colors in your components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-h6 text-foreground mb-3">
                      CSS Custom Properties
                    </h4>
                    <pre className="p-4 bg-muted rounded-lg text-body-sm overflow-x-auto">
                      <code>{`/* Use semantic tokens for theming */
background-color: rgb(var(--color-primary) / <alpha-value>);
color: rgb(var(--color-foreground) / <alpha-value>);

/* Direct brand colors */
background-color: rgb(128 149 175); /* primary-500 */
color: rgb(255 172 137); /* secondary-300 */`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-h6 text-foreground mb-3">
                      Tailwind Classes
                    </h4>
                    <pre className="p-4 bg-muted rounded-lg text-body-sm overflow-x-auto">
                      <code>{`/* Semantic classes (recommended) */
className="bg-primary text-primary-foreground"
className="text-foreground bg-background

/* Brand color classes */
className="bg-primary-500 text-white"
className="text-secondary-300 bg-neutral-50`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-h6 text-foreground mb-3">
                      Component Examples
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                        <div className="font-medium">Primary Button</div>
                        <div className="text-sm opacity-90">
                          Using semantic primary color
                        </div>
                      </div>
                      <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                        <div className="font-medium">Secondary Button</div>
                        <div className="text-sm opacity-90">
                          Using semantic secondary color
                        </div>
                      </div>
                      <div className="p-4 bg-success text-success-foreground rounded-lg">
                        <div className="font-medium">Success State</div>
                        <div className="text-sm opacity-90">
                          Using semantic success color
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Typography</h2>

          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>
                Consistent text sizing and hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-display text-foreground">
                    Display Text
                  </div>
                  <div className="text-caption text-muted-foreground">
                    3.5rem (56px) / Line height: 1.1 / Weight: 700
                  </div>
                </div>
                <div>
                  <div className="text-h1 text-foreground">Heading 1</div>
                  <div className="text-caption text-muted-foreground">
                    3rem (48px) / Line height: 1.2 / Weight: 700
                  </div>
                </div>
                <div>
                  <div className="text-h2 text-foreground">Heading 2</div>
                  <div className="text-caption text-muted-foreground">
                    2.25rem (36px) / Line height: 1.3 / Weight: 600
                  </div>
                </div>
                <div>
                  <div className="text-h3 text-foreground">Heading 3</div>
                  <div className="text-caption text-muted-foreground">
                    1.875rem (30px) / Line height: 1.3 / Weight: 600
                  </div>
                </div>
                <div>
                  <div className="text-h4 text-foreground">Heading 4</div>
                  <div className="text-caption text-muted-foreground">
                    1.5rem (24px) / Line height: 1.4 / Weight: 600
                  </div>
                </div>
                <div>
                  <div className="text-h5 text-foreground">Heading 5</div>
                  <div className="text-caption text-muted-foreground">
                    1.25rem (20px) / Line height: 1.4 / Weight: 500
                  </div>
                </div>
                <div>
                  <div className="text-h6 text-foreground">Heading 6</div>
                  <div className="text-caption text-muted-foreground">
                    1.125rem (18px) / Line height: 1.4 / Weight: 500
                  </div>
                </div>
                <div>
                  <div className="text-body-lg text-foreground">
                    Body Large Text
                  </div>
                  <div className="text-caption text-muted-foreground">
                    1.125rem (18px) / Line height: 1.6 / Weight: 400
                  </div>
                </div>
                <div>
                  <div className="text-body text-foreground">Body Text</div>
                  <div className="text-caption text-muted-foreground">
                    1rem (16px) / Line height: 1.6 / Weight: 400
                  </div>
                </div>
                <div>
                  <div className="text-body-sm text-foreground">
                    Body Small Text
                  </div>
                  <div className="text-caption text-muted-foreground">
                    0.875rem (14px) / Line height: 1.5 / Weight: 400
                  </div>
                </div>
                <div>
                  <div className="text-caption text-foreground">
                    Caption Text
                  </div>
                  <div className="text-caption text-muted-foreground">
                    0.75rem (12px) / Line height: 1.4 / Weight: 400
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing Section */}
        <section id="spacing" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Spacing</h2>

          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>8px base unit spacing system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "xs", value: "4px", class: "w-1" },
                  { name: "sm", value: "8px", class: "w-2" },
                  { name: "md", value: "16px", class: "w-4" },
                  { name: "lg", value: "24px", class: "w-6" },
                  { name: "xl", value: "32px", class: "w-8" },
                  { name: "2xl", value: "40px", class: "w-10" },
                  { name: "3xl", value: "48px", class: "w-12" },
                  { name: "4xl", value: "64px", class: "w-16" },
                  { name: "5xl", value: "80px", class: "w-20" },
                  { name: "6xl", value: "96px", class: "w-24" },
                ].map((spacing) => (
                  <div
                    key={spacing.name}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className={`${spacing.class} h-4 bg-primary rounded`}
                    ></div>
                    <div>
                      <div className="text-body-sm font-medium">
                        {spacing.name}
                      </div>
                      <div className="text-caption text-muted-foreground">
                        {spacing.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Buttons</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  Different button styles for various use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" disabled>
                      Disabled
                    </Button>
                    <Button variant="primary" loading>
                      Loading
                    </Button>
                  </div>
                </div>
                <CodeBlock
                  title="button-variants"
                  code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>
                  Different button sizes for various contexts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>
                <CodeBlock
                  title="button-sizes"
                  code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>`}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Forms Section */}
        <section id="forms" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Form Elements</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
                <CardDescription>
                  Text inputs with various states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Default Input"
                    placeholder="Enter text here..."
                    helperText="This is helper text"
                  />
                  <Input
                    label="Input with Error"
                    placeholder="Enter text here..."
                    error="This field is required"
                  />
                  <Input
                    label="Disabled Input"
                    placeholder="Disabled input"
                    disabled
                  />
                </div>
                <CodeBlock
                  title="input-examples"
                  code={`<Input
  label="Default Input"
  placeholder="Enter text here..."
  helperText="This is helper text"
/>
<Input
  label="Input with Error"
  placeholder="Enter text here..."
  error="This field is required"
/>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Dropdown</CardTitle>
                <CardDescription>Dropdown selection component</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    label="Select Option"
                    options={[
                      { value: "", label: "Choose an option..." },
                      { value: "option1", label: "Option 1" },
                      { value: "option2", label: "Option 2" },
                      { value: "option3", label: "Option 3" },
                    ]}
                    helperText="Select one option from the list"
                  />
                  <Select
                    label="Select with Error"
                    options={[
                      { value: "", label: "Choose an option..." },
                      { value: "option1", label: "Option 1" },
                    ]}
                    error="Please select an option"
                  />
                </div>
                <CodeBlock
                  title="select-examples"
                  code={`<Select
  label="Select Option"
  options={[
    { value: '', label: 'Choose an option...' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  helperText="Select one option from the list"
/>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkboxes</CardTitle>
                <CardDescription>
                  Checkbox inputs for multiple selections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Checkbox
                    label="Default Checkbox"
                    description="This is a description for the checkbox"
                  />
                  <Checkbox label="Checked Checkbox" defaultChecked />
                  <Checkbox label="Disabled Checkbox" disabled />
                  <Checkbox
                    label="Checkbox with Error"
                    error="This field is required"
                  />
                </div>
                <CodeBlock
                  title="checkbox-examples"
                  code={`<Checkbox
  label="Default Checkbox"
  description="This is a description for the checkbox"
/>
<Checkbox
  label="Checked Checkbox"
  defaultChecked
/>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Radio Groups</CardTitle>
                <CardDescription>
                  Radio button groups for single selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup
                    name="example-radio"
                    label="Choose an option"
                    options={[
                      {
                        value: "option1",
                        label: "Option 1",
                        description: "Description for option 1",
                      },
                      {
                        value: "option2",
                        label: "Option 2",
                        description: "Description for option 2",
                      },
                      { value: "option3", label: "Option 3", disabled: true },
                    ]}
                    defaultValue="option1"
                  />
                </div>
                <CodeBlock
                  title="radio-examples"
                  code={`<RadioGroup
  name="example-radio"
  label="Choose an option"
  options={[
    { value: 'option1', label: 'Option 1', description: 'Description for option 1' },
    { value: 'option2', label: 'Option 2', description: 'Description for option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ]}
  defaultValue="option1"
/>`}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Cards</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  A simple card with default styling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-foreground-secondary">
                  This is the content area of the card. You can put any content
                  here.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>A card with shadow elevation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-foreground-secondary">
                  This card has a shadow to create depth and visual hierarchy.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>A card with prominent border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-foreground-secondary">
                  This card uses a thicker border for emphasis.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>

          <CodeBlock
            title="card-examples"
            code={`<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`}
          />
        </section>

        {/* Badges Section */}
        <section id="badges" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Badges</h2>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-h6 text-foreground mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-h6 text-foreground mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm" variant="primary">
                      Small
                    </Badge>
                    <Badge size="md" variant="primary">
                      Medium
                    </Badge>
                    <Badge size="lg" variant="primary">
                      Large
                    </Badge>
                  </div>
                </div>
              </div>

              <CodeBlock
                title="badge-examples"
                code={`<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge size="sm" variant="info">Small Info</Badge>`}
              />
            </CardContent>
          </Card>
        </section>

        {/* Alerts Section */}
        <section id="alerts" className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Alerts</h2>

          <div className="space-y-6">
            <Alert variant="info" title="Information">
              This is an informational alert. Use it to provide helpful
              information to users.
            </Alert>

            <Alert variant="success" title="Success">
              This is a success alert. Use it to confirm that an action was
              completed successfully.
            </Alert>

            <Alert variant="warning" title="Warning">
              This is a warning alert. Use it to warn users about potential
              issues or important information.
            </Alert>

            <Alert
              variant="danger"
              title="Error"
              onClose={() => console.log("Alert closed")}
            >
              This is an error alert with a close button. Use it to inform users
              about errors or critical issues.
            </Alert>

            <Alert variant="info">
              This is an alert without a title. Sometimes you just need a simple
              message.
            </Alert>
          </div>

          <CodeBlock
            title="alert-examples"
            code={`<Alert variant="info" title="Information">
  This is an informational alert.
</Alert>

<Alert variant="success" title="Success">
  Action completed successfully.
</Alert>

<Alert variant="danger" title="Error" onClose={() => handleClose()}>
  An error occurred. Please try again.
</Alert>`}
          />
        </section>

        {/* Usage Guidelines */}
        <section className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">Usage Guidelines</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  WCAG compliance and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-body text-foreground-secondary">
                  <li>
                    • All colors meet WCAG AA contrast requirements (4.5:1
                    minimum)
                  </li>
                  <li>• Focus states are clearly visible with 2px ring</li>
                  <li>
                    • Interactive elements have minimum 44px touch targets
                  </li>
                  <li>• Form labels are properly associated with inputs</li>
                  <li>• Error messages are descriptive and helpful</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation</CardTitle>
                <CardDescription>How to use the design system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      Import Components
                    </h5>
                    <pre className="p-3 bg-muted rounded text-body-sm">
                      <code>{`import { Button, Input, Card } from '@/components/design-system';`}</code>
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      Use Tailwind Classes
                    </h5>
                    <pre className="p-3 bg-muted rounded text-body-sm">
                      <code>{`className="text-primary-600 bg-muted"`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tailwind v4 Migration Status */}
        <section className="mb-12">
          <h2 className="text-h2 text-foreground mb-6">
            Tailwind CSS v4 Migration Status
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  Migration Complete
                </CardTitle>
                <CardDescription>
                  Successfully updated to Tailwind CSS v4.1.12
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      ✅ Completed Updates
                    </h5>
                    <ul className="space-y-1 text-body-sm text-foreground-secondary">
                      <li>• Updated to Tailwind CSS v4.1.12</li>
                      <li>• Configured @tailwindcss/postcss plugin</li>
                      <li>• Migrated to CSS custom properties</li>
                      <li>• Updated PostCSS configuration</li>
                      <li>• Semantic design tokens implemented</li>
                      <li>• Dark mode theming with CSS variables</li>
                      <li>• Brand color palette fully defined</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      🎨 Brand Colors Available
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="primary">Primary (Blue-Gray)</Badge>
                      <Badge variant="secondary">Secondary (Coral)</Badge>
                      <Badge variant="info">Neutral Palette</Badge>
                      <Badge variant="success">Semantic Colors</Badge>
                      <Badge variant="warning">Financial Colors</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Details</CardTitle>
                <CardDescription>
                  Technical implementation details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      Package Versions
                    </h5>
                    <pre className="p-3 bg-muted rounded text-body-sm">
                      <code>{`"tailwindcss": "^4.1.12"
"@tailwindcss/postcss": "^4.1.12"
"postcss": "^8"`}</code>
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      PostCSS Config
                    </h5>
                    <pre className="p-3 bg-muted rounded text-body-sm">
                      <code>{`export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}`}</code>
                    </pre>
                  </div>

                  <div>
                    <h5 className="text-h6 text-foreground mb-2">
                      CSS Custom Properties
                    </h5>
                    <pre className="p-3 bg-muted rounded text-body-sm">
                      <code>{`:root {
  --color-primary: 128 149 175;
  --color-secondary: 255 172 137;
  --color-foreground: 33 37 41;
  /* ... more variables */
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Migration Benefits</CardTitle>
                <CardDescription>
                  Advantages of Tailwind CSS v4 implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="text-h6 text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Performance
                    </h5>
                    <ul className="space-y-1 text-body-sm text-foreground-secondary">
                      <li>• Faster build times</li>
                      <li>• Smaller bundle size</li>
                      <li>• Improved CSS generation</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-h6 text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Theming
                    </h5>
                    <ul className="space-y-1 text-body-sm text-foreground-secondary">
                      <li>• CSS custom properties</li>
                      <li>• Dynamic theme switching</li>
                      <li>• Better dark mode support</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-h6 text-foreground mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      Developer Experience
                    </h5>
                    <ul className="space-y-1 text-body-sm text-foreground-secondary">
                      <li>• Better IntelliSense</li>
                      <li>• Improved error messages</li>
                      <li>• Modern CSS features</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
