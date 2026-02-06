import { getFeaturedProducts } from '@/lib/products';
import ProductCard from '@/components/shop/ProductCard';

export default function FeaturedProducts() {
  const products = getFeaturedProducts();

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Uitgelichte producten
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Een selectie van bijzondere en zeldzame items uit onze collectie
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
          {products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
