'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus,
  Package,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  DollarSign,
  Award
} from 'lucide-react';
import Link from 'next/link';

const tierLimits = {
  BRONZE: { maxProducts: 0, displayName: 'FREE' },
  SILVER: { maxProducts: 5, displayName: 'PREMIUM' },
  GOLD: { maxProducts: Infinity, displayName: 'PRO' },
  PLATINUM: { maxProducts: Infinity, displayName: 'PRO PLUS' }
};

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchProducts();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/sponsors/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.sponsorProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/sponsors/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/sponsors/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchProducts();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/sponsors/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const currentTier = profile.partnershipTier;
  const tierLimit = tierLimits[currentTier as keyof typeof tierLimits];
  const canAddProduct = tierLimit.maxProducts === Infinity || products.length < tierLimit.maxProducts;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage your products for point redemption
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2">
            {products.length} / {tierLimit.maxProducts === Infinity ? '∞' : tierLimit.maxProducts} Products
          </Badge>
          {canAddProduct ? (
            <Link href="/sponsors/portal/products/new">
              <Button className="bg-gradient-to-r from-teal-500 to-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="bg-gray-400 cursor-not-allowed"
              title="Upgrade your tier to add more products"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product (Limit Reached)
            </Button>
          )}
        </div>
      </div>

      {/* Tier Limit Warning */}
      {!canAddProduct && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Product Limit Reached</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You've reached the maximum of {tierLimit.maxProducts} products for your {tierLimit.displayName} tier.
                  Upgrade to add more products.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-gradient-to-r from-teal-500 to-purple-500"
                  onClick={() => router.push('/sponsors/portal/settings?tab=billing')}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first product to get started with point redemptions'}
            </p>
            {!searchQuery && canAddProduct && (
              <Link href="/sponsors/portal/products/new">
                <Button className="bg-gradient-to-r from-teal-500 to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Product Image */}
                {product.imageUrl && (
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.isActive && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-white bg-gray-700">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                      <Badge className="bg-teal-100 text-teal-700 whitespace-nowrap">
                        <Award className="w-3 h-3 mr-1" />
                        {product.pointsCost} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{product.retailValue}</span>
                      </div>
                      <div className="text-gray-500">
                        {product.category}
                      </div>
                    </div>

                    {product.stockQuantity !== undefined && !product.unlimitedStock && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Stock: {product.stockQuantity}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/sponsors/portal/products/${product.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                    >
                      {product.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
