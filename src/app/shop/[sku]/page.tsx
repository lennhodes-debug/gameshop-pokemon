import { getAllProducts, getProductBySku, getProductsByPlatform } from '@/lib/products';
import ProductDetail from '@/components/product/ProductDetail';
import RelatedProducts from '@/components/product/RelatedProducts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: { sku: string };
}

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    sku: product.sku,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProductBySku(params.sku);
  if (!product) return { title: 'Product niet gevonden' };

  return {
    title: product.name,
    description: product.description || `${product.name} - ${product.platform} - ${product.condition}`,
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySku(params.sku);

  if (!product) {
    notFound();
  }

  const related = getProductsByPlatform(product.platform)
    .filter((p) => p.sku !== product.sku)
    .slice(0, 4);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <ProductDetail product={product} />
        <RelatedProducts products={related} />
      </div>
    </div>
  );
}
