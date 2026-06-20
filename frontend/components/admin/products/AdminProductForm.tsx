'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminCategory,
  createAdminProduct,
  getAdminCategories,
  uploadProductImages,
} from '../../../lib/api/admin-products';
import type { Category } from '../../../types/catalog';
import type { AdminProductStatus, UploadedProductImage } from '../../../types/admin/products';

type VariantForm = {
  colorName: string;
  colorSlug: string;
  colorHex: string;
  size: string;
  stock: string;
  sku: string;
  images: UploadedProductImage[];
};

const emptyVariant = (): VariantForm => ({
  colorName: 'Black',
  colorSlug: 'black',
  colorHex: '#111111',
  size: '32',
  stock: '1',
  sku: '',
  images: [],
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function AdminProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [status, setStatus] = useState<AdminProductStatus>('DRAFT');
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const nextCategories = await getAdminCategories();
        setCategories(nextCategories);
        setCategoryId(nextCategories[0]?.id ?? '');
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Unable to load categories.',
        );
      }
    }

    void loadCategories();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    try {
      const category = await createAdminCategory({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName),
      });
      setCategories((current) => [...current, category]);
      setCategoryId(category.id);
      setNewCategoryName('');
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Unable to create category.',
      );
    }
  };

  const handleUploadImages = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const variant = variants[index];
    const productSlug = slug || slugify(name);

    if (!selectedCategory?.slug || !productSlug || !variant.colorSlug) {
      setError('Category, product slug, and color slug are required before upload.');
      return;
    }

    if (files.length > 5) {
      setError('Upload up to 5 images per color.');
      return;
    }

    try {
      setUploadingIndex(index);
      setError(null);
      const images = await uploadProductImages({
        files: Array.from(files),
        categorySlug: selectedCategory.slug,
        productSlug,
        colorSlug: variant.colorSlug,
      });
      updateVariant(index, { images });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const product = await createAdminProduct({
        name: name.trim(),
        slug: (slug || slugify(name)).trim(),
        description: description.trim() || undefined,
        priceInPaise: Math.round(Number(price) * 100),
        categoryId,
        status,
        variants: variants.map((variant) => ({
          colorName: variant.colorName.trim(),
          colorSlug: variant.colorSlug.trim(),
          colorHex: variant.colorHex || undefined,
          size: variant.size.trim(),
          stock: Number(variant.stock),
          sku: variant.sku.trim() || undefined,
          images: variant.images,
        })),
      });
      setSuccess('Product created.');
      router.push(`/admin/products?created=${product.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to create product.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="border border-[#e5e5e5] p-6">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#777777]">
            Product
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Slug</span>
              <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder={slugify(name)} className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Price INR</span>
              <input value={price} inputMode="decimal" onChange={(event) => setPrice(event.target.value)} className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Category</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-11 w-full border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as AdminProductStatus)} className="h-11 w-full border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 w-full border border-[#d9d9d9] px-4 py-3 text-sm outline-none focus:border-[#111111]" />
            </label>
          </div>
        </div>

        {variants.map((variant, index) => (
          <div key={index} className="border border-[#e5e5e5] p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Variant {index + 1}</p>
              {variants.length > 1 && (
                <button type="button" onClick={() => setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))} className="text-sm underline-offset-4 hover:underline">Remove</button>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <input placeholder="Color name" value={variant.colorName} onChange={(event) => updateVariant(index, { colorName: event.target.value, colorSlug: slugify(event.target.value) })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
              <input placeholder="Color slug" value={variant.colorSlug} onChange={(event) => updateVariant(index, { colorSlug: slugify(event.target.value) })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
              <input placeholder="#111111" value={variant.colorHex} onChange={(event) => updateVariant(index, { colorHex: event.target.value })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
              <input placeholder="Size" value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
              <input placeholder="Stock" value={variant.stock} inputMode="numeric" onChange={(event) => updateVariant(index, { stock: event.target.value })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
              <input placeholder="SKU" value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]" />
            </div>
            <div className="mt-5">
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void handleUploadImages(index, event.target.files)} className="block w-full text-sm" />
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777777]">
                {uploadingIndex === index ? 'Uploading images' : `${variant.images.length} image${variant.images.length === 1 ? '' : 's'} uploaded`}
              </p>
              {variant.images.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {variant.images.map((image) => (
                    <img key={image.publicId} src={image.url} alt={image.altText ?? 'Product image'} className="aspect-square w-full object-cover" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setVariants((current) => [...current, emptyVariant()])} className="h-12 border border-[#d9d9d9] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]">
          Add variant
        </button>
      </section>

      <aside className="h-fit border border-[#e5e5e5] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Publish</p>
        <div className="mt-5 flex gap-2">
          <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="New category" className="h-11 min-w-0 flex-1 border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#111111]" />
          <button type="button" onClick={handleCreateCategory} className="h-11 border border-[#111111] px-4 text-sm uppercase tracking-[0.08em]">Add</button>
        </div>
        {error && <p className="mt-5 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        {success && <p className="mt-5 text-sm leading-6 text-[#1f6b3a]">{success}</p>}
        <button disabled={isSubmitting} className="mt-6 h-12 w-full border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:text-[#777777]">
          {isSubmitting ? 'Creating product' : 'Create product'}
        </button>
      </aside>
    </form>
  );
}
