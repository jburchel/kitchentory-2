import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TypographyShowcase() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="heading-display">Kitchentory Typography System</h1>
        <p className="text-large text-secondary reading-width">
          A comprehensive brandbook-compliant typography hierarchy built with Inter font family, 
          Major Third scale (1.250), and responsive design principles.
        </p>
      </div>

      {/* Typography Hierarchy */}
      <section className="space-y-8">
        <h2 className="heading-page">Typography Hierarchy</h2>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Heading Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-caption">HEADING-DISPLAY</div>
                <div className="heading-display">Display Heading</div>
                <div className="text-small text-muted">
                  36px/40px, Font Weight 800, Letter Spacing -0.02em
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">HEADING-PAGE</div>
                <div className="heading-page">Page Heading</div>
                <div className="text-small text-muted">
                  30px/36px, Font Weight 700, Letter Spacing -0.01em
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">HEADING-SECTION</div>
                <div className="heading-section">Section Heading</div>
                <div className="text-small text-muted">
                  24px/32px, Font Weight 600, Letter Spacing -0.005em
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">HEADING-SUBSECTION</div>
                <div className="heading-subsection">Subsection Heading</div>
                <div className="text-small text-muted">
                  20px/28px, Font Weight 600, Letter Spacing 0
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">HEADING-COMPONENT</div>
                <div className="heading-component">Component Heading</div>
                <div className="text-small text-muted">
                  18px/28px, Font Weight 500, Letter Spacing 0
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Body Text Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-caption">TEXT-LARGE</div>
                <div className="text-large">Large text for emphasized content and important information.</div>
                <div className="text-small text-muted">
                  18px/28px, Font Weight 400, Letter Spacing 0
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TEXT-BODY</div>
                <div className="text-body">Body text for primary content and general reading. This is the default size for most content.</div>
                <div className="text-small text-muted">
                  16px/24px, Font Weight 400, Letter Spacing 0
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TEXT-SMALL</div>
                <div className="text-small">Small text for secondary information, captions, and supporting content.</div>
                <div className="text-small text-muted">
                  14px/20px, Font Weight 400, Letter Spacing 0
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TEXT-CAPTION</div>
                <div className="text-caption">Caption Text for Labels and Metadata</div>
                <div className="text-small text-muted">
                  12px/16px, Font Weight 400, Letter Spacing 0.01em, Uppercase
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Typography */}
      <section className="space-y-8">
        <h2 className="heading-page">Interactive Typography</h2>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Link Styles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-caption">TEXT-LINK</div>
                <p className="text-body">
                  This paragraph contains a <a href="#" className="text-link">text link</a> that demonstrates 
                  the interactive hover and focus states with proper accessibility.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TEXT-BRAND-EMPHASIS</div>
                <p className="text-body">
                  Important information can be highlighted with <span className="text-brand-emphasis">brand emphasis styling</span> 
                  for increased visual weight.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TEXT-GRADIENT</div>
                <div className="text-gradient">Gradient Text Effect</div>
                <div className="text-small text-muted">
                  Progressive enhancement with fallback support
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Button Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button className="text-button">
                  Primary Button
                </Button>
                <Button variant="outline" className="text-button">
                  Outline Button
                </Button>
                <Button variant="ghost" className="text-button">
                  Ghost Button
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="text-button-small">
                  Small Button
                </Button>
                <Button size="lg" className="text-button-large">
                  Large Button
                </Button>
              </div>

              <div className="text-small text-muted">
                Button text uses font-weight 500 with slight letter spacing for optimal readability.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Text Hierarchy Colors */}
      <section className="space-y-8">
        <h2 className="heading-page">Text Color Hierarchy</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Color System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <div className="text-caption">PRIMARY TEXT</div>
                <div className="text-body text-primary">
                  Primary text color for headings and important content.
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-caption">SECONDARY TEXT</div>
                <div className="text-body text-secondary">
                  Secondary text color for supporting information and descriptions.
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-caption">MUTED TEXT</div>
                <div className="text-body text-muted">
                  Muted text color for metadata, captions, and less important information.
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-caption">DISABLED TEXT</div>
                <div className="text-body text-disabled">
                  Disabled text color for inactive elements and placeholder content.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Semantic Colors */}
      <section className="space-y-8">
        <h2 className="heading-page">Semantic Typography</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Status & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <div className="text-caption">SUCCESS</div>
                <div className="text-body text-success">
                  Item successfully added to inventory
                </div>
                <Badge className="bg-success text-white">Success Badge</Badge>
              </div>

              <div className="space-y-3">
                <div className="text-caption">WARNING</div>
                <div className="text-body text-warning">
                  This item expires in 2 days
                </div>
                <Badge className="bg-warning text-white">Warning Badge</Badge>
              </div>

              <div className="space-y-3">
                <div className="text-caption">ERROR</div>
                <div className="text-body text-error">
                  Failed to scan barcode
                </div>
                <Badge className="bg-error text-white">Error Badge</Badge>
              </div>

              <div className="space-y-3">
                <div className="text-caption">INFO</div>
                <div className="text-body text-info">
                  New features available
                </div>
                <Badge className="bg-info text-white">Info Badge</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Category Colors */}
      <section className="space-y-8">
        <h2 className="heading-page">Category Typography</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Food Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="text-small text-category-produce">Produce</div>
                <div className="text-small text-category-protein">Protein</div>
              </div>
              <div className="space-y-2">
                <div className="text-small text-category-dairy">Dairy</div>
                <div className="text-small text-category-grains">Grains</div>
              </div>
              <div className="space-y-2">
                <div className="text-small text-category-beverages">Beverages</div>
                <div className="text-small text-category-frozen">Frozen</div>
              </div>
              <div className="space-y-2">
                <div className="text-small text-category-pantry">Pantry</div>
                <div className="text-small text-category-household">Household</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Responsive Typography */}
      <section className="space-y-8">
        <h2 className="heading-page">Responsive Features</h2>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Mobile Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-caption">FLUID SIZING</div>
                <div className="text-body">
                  All typography uses clamp() functions for fluid scaling between mobile and desktop sizes.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">IOS ZOOM PREVENTION</div>
                <div className="text-body">
                  Minimum 16px font size on mobile prevents iOS zoom on input focus.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">TOUCH TARGETS</div>
                <div className="text-body">
                  Interactive typography maintains 44px minimum touch target size.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="heading-subsection">Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-caption">WCAG AA COMPLIANCE</div>
                <div className="text-body">
                  All text colors meet WCAG AA contrast requirements with automatic dark mode support.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">HIGH CONTRAST SUPPORT</div>
                <div className="text-body">
                  Enhanced contrast and focus styles for users with visual impairments.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-caption">REDUCED MOTION</div>
                <div className="text-body">
                  Respects prefers-reduced-motion for users sensitive to animations.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reading Width */}
      <section className="space-y-8">
        <h2 className="heading-page">Reading Experience</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Optimal Line Length</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-caption">STANDARD READING WIDTH (65CH)</div>
              <div className="text-body reading-width">
                This paragraph demonstrates the standard reading width of 65 characters, which provides optimal readability 
                for most content. Research shows that this width reduces eye strain and improves reading comprehension by 
                preventing excessively long lines that are difficult to follow from end to beginning.
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-caption">NARROW READING WIDTH (45CH)</div>
              <div className="text-body reading-width-narrow">
                This narrower column width of 45 characters works well for sidebars, callouts, and secondary content 
                where space is limited but readability remains important.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Implementation Guide */}
      <section className="space-y-8">
        <h2 className="heading-page">Implementation Guide</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="heading-subsection">Usage Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-caption">BASIC USAGE</div>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {'<h1 className="heading-display">Page Title</h1>'}<br/>
                {'<p className="text-body">Content text</p>'}<br/>
                {'<a href="#" className="text-link">Interactive link</a>'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-caption">RESPONSIVE MODIFIERS</div>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {'<h1 className="heading-display sm:heading-display-tablet lg:heading-display-desktop">'}<br/>
                {'  Responsive Heading'}<br/>
                {'</h1>'}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-caption">SEMANTIC STYLING</div>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {'<p className="text-body text-success">Success message</p>'}<br/>
                {'<span className="text-small text-category-produce">Produce category</span>'}<br/>
                {'<div className="text-gradient">Brand highlight</div>'}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center pt-8 border-t">
        <div className="text-small text-muted">
          Kitchentory Typography System v2.0 • Built with Inter font family • Brandbook compliant
        </div>
      </footer>
    </div>
  )
}