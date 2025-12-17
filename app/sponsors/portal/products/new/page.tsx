'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    pointsCost: 100,
    retailValue: 10,
    stockQuantity: 0,
    unlimitedStock: true,
    isActive: true,
  });

  const calculateSuggestedPoints = () => {
    // Suggested formula: $1 = 10 points
    const suggested = Math.round(formData.retailValue * 10);
    setFormData({ ...formData, pointsCost: suggested });
    toast.success(`Suggested ${suggested} points for $${formData.retailValue}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sponsors/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Product created successfully!');
        router.push('/sponsors/portal/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/sponsors/portal/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Add a product that users can redeem with their reward points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Premium Pickleball Paddle"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product in detail..."
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Equipment, Apparel, Accessories, etc."
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://imagify.io/blog/wp-content/uploads/2023/01/Most-common-banners-on-the-web-Source-Publift-.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 800x600px or larger
              </p>
            </div>

            {/* Retail Value & Points */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retailValue">Retail Value ($) *</Label>
                <Input
                  id="retailValue"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.retailValue}
                  onChange={(e) => setFormData({ ...formData, retailValue: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pointsCost">Point Cost *</Label>
                <div className="flex gap-2">
                  <Input
                    id="pointsCost"
                    type="number"
                    min="1"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={calculateSuggestedPoints}
                    title="Calculate suggested points"
                  >
                    <Calculator className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Suggestion: ${formData.retailValue} = {Math.round(formData.retailValue * 10)} points
                </p>
              </div>
            </div>

            {/* Stock */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="unlimitedStock">Unlimited Stock</Label>
                <Switch
                  id="unlimitedStock"
                  checked={formData.unlimitedStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, unlimitedStock: checked })}
                />
              </div>
              {!formData.unlimitedStock && (
                <Input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  placeholder="Stock quantity"
                />
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isActive">Activate Product Immediately</Label>
                <p className="text-sm text-gray-500">
                  Users can redeem this product once activated
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sponsors/portal/products')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
