import { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import { productService, Product } from './services/productService';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = (searchQuery ? filteredProducts : products).filter(
        (p) => p.category === selectedCategory
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(searchQuery ? filteredProducts : products);
    }
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      const results = await productService.searchProducts(query);
      setFilteredProducts(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (product: Product) => {
    try {
      if (editingProduct?.id) {
        await productService.updateProduct(editingProduct.id, product);
      } else {
        await productService.createProduct(product);
      }
      setIsModalOpen(false);
      setEditingProduct(undefined);
      await loadProducts();
      await loadCategories();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onAddProduct={handleAddProduct}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
        />
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
      />
    </div>
  );
}

export default App;
