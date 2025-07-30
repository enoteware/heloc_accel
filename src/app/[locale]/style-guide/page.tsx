'use client';

import React, { useState } from 'react';
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
  ValidationMessage
} from '@/components/design-system';
import Logo from '@/components/Logo';

export default function StyleGuidePage() {
  const [showCode, setShowCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [progressValue, setProgressValue] = useState(65);

  const CodeBlock = ({ code, title }: { code: string; title: string }) => (
    <div className="mt-4">
      <button
        onClick={() => setShowCode(showCode === title ? null : title)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {showCode === title ? 'Hide' : 'Show'} Code
      </button>
      {showCode === title && (
        <pre className="mt-2 p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-x-auto text-sm">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo
                  size="md"
                  showText={false}
                  clickable={false}
                />
                <div>
                  <h1 className="text-h1 text-neutral-900 dark:text-neutral-100">Design System</h1>
                  <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mt-2">
                    Comprehensive style guide and component library for HELOC Accelerator
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
            <CardDescription>Navigate through the design system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="#logo" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Logo</a>
              <a href="#colors" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Colors</a>
              <a href="#typography" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Typography</a>
              <a href="#spacing" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Spacing</a>
              <a href="#buttons" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Buttons</a>
              <a href="#forms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Form Elements</a>
              <a href="#advanced-forms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Advanced Forms</a>
              <a href="#cards" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Cards</a>
              <a href="#badges" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Badges</a>
              <a href="#alerts" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Alerts</a>
              <a href="#modals" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Modals</a>
              <a href="#dropdowns" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Dropdowns</a>
              <a href="#tabs" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Tabs</a>
              <a href="#progress" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Progress</a>
              <a href="#tooltips" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Tooltips</a>
              <a href="#animations" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Animations</a>
              <a href="#theme" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Dark Mode</a>
            </div>
          </CardContent>
        </Card>

        {/* Logo Section */}
        <section id="logo" className="mb-12">
          <h2 className="text-h2 text-neutral-900 mb-6">Logo</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Logo Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Logo Variants</CardTitle>
                <CardDescription>Different logo styles for various contexts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-body font-medium mb-3">Default Logo</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Logo variant="default" size="lg" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">Logo with Text</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Logo variant="default" size="md" showText={true} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">White Logo (on dark background)</h4>
                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <Logo variant="white" size="lg" showText={false} clickable={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Logo Sizes</CardTitle>
                <CardDescription>Different logo sizes for various use cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-body font-medium mb-3">Small (32px)</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Logo size="sm" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">Medium (48px)</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Logo size="md" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">Large (64px)</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Logo size="lg" showText={false} clickable={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-body font-medium mb-3">Extra Large (96px)</h4>
                    <div className="p-4 bg-neutral-50 rounded-lg">
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
          <h2 className="text-h2 text-neutral-900 mb-6">Colors</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
                <CardDescription>Blue-gray palette from brand identity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Primary 50', value: '#f0f4f8', class: 'bg-primary-50' },
                    { name: 'Primary 100', value: '#d9e2ec', class: 'bg-primary-100' },
                    { name: 'Primary 200', value: '#bcccdc', class: 'bg-primary-200' },
                    { name: 'Primary 300', value: '#9fb3c8', class: 'bg-primary-300' },
                    { name: 'Primary 400', value: '#829ab1', class: 'bg-primary-400' },
                    { name: 'Primary 500', value: '#8095af', class: 'bg-primary-500' },
                    { name: 'Primary 600', value: '#627d98', class: 'bg-primary-600' },
                    { name: 'Primary 700', value: '#486581', class: 'bg-primary-700' },
                    { name: 'Primary 800', value: '#334e68', class: 'bg-primary-800' },
                    { name: 'Primary 900', value: '#00193f', class: 'bg-primary-900' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded ${color.class} border border-neutral-200`}></div>
                      <div>
                        <div className="text-body-sm font-medium">{color.name}</div>
                        <div className="text-caption text-neutral-500">{color.value}</div>
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
                    { name: 'Secondary 50', value: '#fff4f1', class: 'bg-secondary-50' },
                    { name: 'Secondary 100', value: '#ffe4dc', class: 'bg-secondary-100' },
                    { name: 'Secondary 200', value: '#ffc9b9', class: 'bg-secondary-200' },
                    { name: 'Secondary 300', value: '#ffac89', class: 'bg-secondary-300' },
                    { name: 'Secondary 400', value: '#ff8f66', class: 'bg-secondary-400' },
                    { name: 'Secondary 500', value: '#ff7043', class: 'bg-secondary-500' },
                    { name: 'Secondary 600', value: '#e55a2b', class: 'bg-secondary-600' },
                    { name: 'Secondary 700', value: '#cc4125', class: 'bg-secondary-700' },
                    { name: 'Secondary 800', value: '#b8321f', class: 'bg-secondary-800' },
                    { name: 'Secondary 900', value: '#7f433a', class: 'bg-secondary-900' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded ${color.class} border border-neutral-200`}></div>
                      <div>
                        <div className="text-body-sm font-medium">{color.name}</div>
                        <div className="text-caption text-neutral-500">{color.value}</div>
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
                <CardDescription>Grayscale palette for text and backgrounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Neutral 50', value: '#fffefe', class: 'bg-neutral-50' },
                    { name: 'Neutral 100', value: '#f7fafc', class: 'bg-neutral-100' },
                    { name: 'Neutral 200', value: '#edf2f7', class: 'bg-neutral-200' },
                    { name: 'Neutral 300', value: '#e2e8f0', class: 'bg-neutral-300' },
                    { name: 'Neutral 400', value: '#cbd5e0', class: 'bg-neutral-400' },
                    { name: 'Neutral 500', value: '#a0aec0', class: 'bg-neutral-500' },
                    { name: 'Neutral 600', value: '#80828e', class: 'bg-neutral-600' },
                    { name: 'Neutral 700', value: '#4a5568', class: 'bg-neutral-700' },
                    { name: 'Neutral 800', value: '#2d3748', class: 'bg-neutral-800' },
                    { name: 'Neutral 900', value: '#1a202c', class: 'bg-neutral-900' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded ${color.class} border border-neutral-200`}></div>
                      <div>
                        <div className="text-body-sm font-medium">{color.name}</div>
                        <div className="text-caption text-neutral-500">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography" className="mb-12">
          <h2 className="text-h2 text-neutral-900 mb-6">Typography</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Consistent text sizing and hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-display text-neutral-900">Display Text</div>
                  <div className="text-caption text-neutral-500">3.5rem (56px) / Line height: 1.1 / Weight: 700</div>
                </div>
                <div>
                  <div className="text-h1 text-neutral-900">Heading 1</div>
                  <div className="text-caption text-neutral-500">3rem (48px) / Line height: 1.2 / Weight: 700</div>
                </div>
                <div>
                  <div className="text-h2 text-neutral-900">Heading 2</div>
                  <div className="text-caption text-neutral-500">2.25rem (36px) / Line height: 1.3 / Weight: 600</div>
                </div>
                <div>
                  <div className="text-h3 text-neutral-900">Heading 3</div>
                  <div className="text-caption text-neutral-500">1.875rem (30px) / Line height: 1.3 / Weight: 600</div>
                </div>
                <div>
                  <div className="text-h4 text-neutral-900">Heading 4</div>
                  <div className="text-caption text-neutral-500">1.5rem (24px) / Line height: 1.4 / Weight: 600</div>
                </div>
                <div>
                  <div className="text-h5 text-neutral-900">Heading 5</div>
                  <div className="text-caption text-neutral-500">1.25rem (20px) / Line height: 1.4 / Weight: 500</div>
                </div>
                <div>
                  <div className="text-h6 text-neutral-900">Heading 6</div>
                  <div className="text-caption text-neutral-500">1.125rem (18px) / Line height: 1.4 / Weight: 500</div>
                </div>
                <div>
                  <div className="text-body-lg text-neutral-900">Body Large Text</div>
                  <div className="text-caption text-neutral-500">1.125rem (18px) / Line height: 1.6 / Weight: 400</div>
                </div>
                <div>
                  <div className="text-body text-neutral-900">Body Text</div>
                  <div className="text-caption text-neutral-500">1rem (16px) / Line height: 1.6 / Weight: 400</div>
                </div>
                <div>
                  <div className="text-body-sm text-neutral-900">Body Small Text</div>
                  <div className="text-caption text-neutral-500">0.875rem (14px) / Line height: 1.5 / Weight: 400</div>
                </div>
                <div>
                  <div className="text-caption text-neutral-900">Caption Text</div>
                  <div className="text-caption text-neutral-500">0.75rem (12px) / Line height: 1.4 / Weight: 400</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing Section */}
        <section id="spacing" className="mb-12">
          <h2 className="text-h2 text-neutral-900 mb-6">Spacing</h2>

          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>8px base unit spacing system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'xs', value: '4px', class: 'w-1' },
                  { name: 'sm', value: '8px', class: 'w-2' },
                  { name: 'md', value: '16px', class: 'w-4' },
                  { name: 'lg', value: '24px', class: 'w-6' },
                  { name: 'xl', value: '32px', class: 'w-8' },
                  { name: '2xl', value: '40px', class: 'w-10' },
                  { name: '3xl', value: '48px', class: 'w-12' },
                  { name: '4xl', value: '64px', class: 'w-16' },
                  { name: '5xl', value: '80px', class: 'w-20' },
                  { name: '6xl', value: '96px', class: 'w-24' },
                ].map((spacing) => (
                  <div key={spacing.name} className="flex items-center space-x-4">
                    <div className={`${spacing.class} h-4 bg-primary-500 rounded`}></div>
                    <div>
                      <div className="text-body-sm font-medium">{spacing.name}</div>
                      <div className="text-caption text-neutral-500">{spacing.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="mb-12">
          <h2 className="text-h2 text-neutral-900 mb-6">Buttons</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different button styles for various use cases</CardDescription>
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
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="primary" loading>Loading</Button>
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
                <CardDescription>Different button sizes for various contexts</CardDescription>
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
          <h2 className="text-h2 text-neutral-900 mb-6">Form Elements</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
                <CardDescription>Text inputs with various states</CardDescription>
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
                      { value: '', label: 'Choose an option...' },
                      { value: 'option1', label: 'Option 1' },
                      { value: 'option2', label: 'Option 2' },
                      { value: 'option3', label: 'Option 3' },
                    ]}
                    helperText="Select one option from the list"
                  />
                  <Select
                    label="Select with Error"
                    options={[
                      { value: '', label: 'Choose an option...' },
                      { value: 'option1', label: 'Option 1' },
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
                <CardDescription>Checkbox inputs for multiple selections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Checkbox
                    label="Default Checkbox"
                    description="This is a description for the checkbox"
                  />
                  <Checkbox
                    label="Checked Checkbox"
                    defaultChecked
                  />
                  <Checkbox
                    label="Disabled Checkbox"
                    disabled
                  />
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
                <CardDescription>Radio button groups for single selection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup
                    name="example-radio"
                    label="Choose an option"
                    options={[
                      { value: 'option1', label: 'Option 1', description: 'Description for option 1' },
                      { value: 'option2', label: 'Option 2', description: 'Description for option 2' },
                      { value: 'option3', label: 'Option 3', disabled: true },
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
          <h2 className="text-h2 text-neutral-900 mb-6">Cards</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>A simple card with default styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-neutral-600">
                  This is the content area of the card. You can put any content here.
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
                <p className="text-body text-neutral-600">
                  This card has a shadow to create depth and visual hierarchy.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>A card with prominent border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body text-neutral-600">
                  This card uses a thicker border for emphasis.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">Action</Button>
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
          <h2 className="text-h2 text-neutral-900 mb-6">Badges</h2>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-h6 text-neutral-900 mb-3">Variants</h4>
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
                  <h4 className="text-h6 text-neutral-900 mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm" variant="primary">Small</Badge>
                    <Badge size="md" variant="primary">Medium</Badge>
                    <Badge size="lg" variant="primary">Large</Badge>
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
          <h2 className="text-h2 text-neutral-900 mb-6">Alerts</h2>

          <div className="space-y-6">
            <Alert variant="info" title="Information">
              This is an informational alert. Use it to provide helpful information to users.
            </Alert>

            <Alert variant="success" title="Success">
              This is a success alert. Use it to confirm that an action was completed successfully.
            </Alert>

            <Alert variant="warning" title="Warning">
              This is a warning alert. Use it to warn users about potential issues or important information.
            </Alert>

            <Alert variant="danger" title="Error" onClose={() => console.log('Alert closed')}>
              This is an error alert with a close button. Use it to inform users about errors or critical issues.
            </Alert>

            <Alert variant="info">
              This is an alert without a title. Sometimes you just need a simple message.
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
          <h2 className="text-h2 text-neutral-900 mb-6">Usage Guidelines</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>WCAG compliance and best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-body text-neutral-700">
                  <li>• All colors meet WCAG AA contrast requirements (4.5:1 minimum)</li>
                  <li>• Focus states are clearly visible with 2px ring</li>
                  <li>• Interactive elements have minimum 44px touch targets</li>
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
                    <h5 className="text-h6 text-neutral-900 mb-2">Import Components</h5>
                    <pre className="p-3 bg-neutral-100 rounded text-body-sm">
                      <code>{`import { Button, Input, Card } from '@/components/design-system';`}</code>
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-h6 text-neutral-900 mb-2">Use Tailwind Classes</h5>
                    <pre className="p-3 bg-neutral-100 rounded text-body-sm">
                      <code>{`className="text-primary-600 bg-neutral-50"`}</code>
                    </pre>
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
