"use client";

import { Button } from "@/components/design-system/Button";

export default function TestStylingPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Tailwind CSS v4 Styling Test
        </h1>

        {/* Color Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              Primary
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
              Secondary
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded-lg">
              Accent
            </div>
            <div className="p-4 bg-surface border border-border text-foreground rounded-lg">
              Surface
            </div>
          </div>
        </section>

        {/* Button Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </section>

        {/* Input Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <input
              type="text"
              placeholder="Default input"
              className="input-default"
            />
            <input
              type="email"
              placeholder="Email input"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Textarea"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>
        </section>

        {/* Card Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-default p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Default Card
              </h3>
              <p className="text-muted-foreground">
                This is a default card with border.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Elevated Card
              </h3>
              <p className="text-muted-foreground">
                This is an elevated card with shadow.
              </p>
            </div>
            <div className="card-outlined p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Outlined Card
              </h3>
              <p className="text-muted-foreground">
                This is an outlined card with thick border.
              </p>
            </div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Typography</h2>
          <div className="space-y-2">
            <h1 className="text-h1 text-foreground">Heading 1</h1>
            <h2 className="text-h2 text-foreground">Heading 2</h2>
            <h3 className="text-h3 text-foreground">Heading 3</h3>
            <p className="text-body text-foreground">
              This is body text. It should be readable and properly styled.
            </p>
            <p className="text-body-sm text-muted-foreground">
              This is small body text with muted color.
            </p>
          </div>
        </section>

        {/* Badge Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <span className="badge-default badge-md">Default</span>
            <span className="badge-primary badge-md">Primary</span>
            <span className="badge-secondary badge-md">Secondary</span>
            <span className="badge-success badge-md">Success</span>
            <span className="badge-warning badge-md">Warning</span>
            <span className="badge-danger badge-md">Danger</span>
            <span className="badge-info badge-md">Info</span>
          </div>
        </section>

        {/* Alert Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Alerts</h2>
          <div className="space-y-4">
            <div className="alert-info">
              <strong>Info:</strong> This is an informational alert.
            </div>
            <div className="alert-success">
              <strong>Success:</strong> This is a success alert.
            </div>
            <div className="alert-warning">
              <strong>Warning:</strong> This is a warning alert.
            </div>
            <div className="alert-danger">
              <strong>Error:</strong> This is an error alert.
            </div>
          </div>
        </section>

        {/* Utility Classes Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Utility Classes
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-surface border border-border rounded-lg">
              <p className="text-foreground mb-2">Standard Tailwind classes:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  Blue
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Green
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                  Red
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  Yellow
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
