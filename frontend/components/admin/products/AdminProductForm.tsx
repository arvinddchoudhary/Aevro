'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminCategory,
  createAdminProduct,
  getAdminCategories,
  updateAdminProduct,
  uploadProductImages,
} from '../../../lib/api/admin-products';
import type { Category } from '../../../types/catalog';
import type {
  AdminProduct,
  AdminProductStatus,
  UploadedProductImage,
} from '../../../types/admin/products';

type VariantForm = {
  colorName: string;
  colorSlug: string;
  colorHex: string;
  size: string;
  stock: string;
  sku: string;
  images: UploadedProductImage[];
};

const MAX_IMAGES_PER_COLOR = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

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

function getReadableError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (error.message.toLowerCase().includes('internal server error')) {
    return 'The server could not complete this admin request. Check backend logs and required environment variables.';
  }

  return error.message;
}

function validateImageFiles(files: File[], existingCount: number) {
  if (files.length === 0) {
    return 'Select at least one image.';
  }

  if (existingCount + files.length > MAX_IMAGES_PER_COLOR) {
    return `Upload up to ${MAX_IMAGES_PER_COLOR} images for this color.`;
  }

  const invalidType = files.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));

  if (invalidType) {
    return 'Only jpg, jpeg, png, and webp images are allowed.';
  }

  const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);

  if (oversizedFile) {
    return 'Each image must be 5MB or smaller.';
  }

  return null;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
      {children}
    </span>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
      />
    </label>
  );
}

type AdminProductFormProps = {
  product?: AdminProduct;
};

function productToVariants(product?: AdminProduct): VariantForm[] {
  if (!product?.variants.length) {
    return [emptyVariant()];
  }

  return product.variants.map((variant) => ({
    colorName: variant.colorName,
    colorSlug: variant.colorSlug,
    colorHex: variant.colorHex ?? '',
    size: variant.size,
    stock: String(variant.stock),
    sku: variant.sku ?? '',
    images: variant.images.map((image, index) => ({
      url: image.url,
      publicId: image.publicId,
      altText: image.altText ?? undefined,
      sortOrder: image.sortOrder ?? index,
      isPrimary: image.isPrimary ?? index === 0,
    })),
  }));
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(product);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(
    product ? String(product.priceInPaise / 100) : '',
  );
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [status, setStatus] = useState<AdminProductStatus>(
    product?.status ?? 'DRAFT',
  );
  const [variants, setVariants] = useState<VariantForm[]>(
    productToVariants(product),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const nextCategories = await getAdminCategories();
        setCategories(nextCategories);
        setCategoryId((currentCategoryId) =>
          currentCategoryId || nextCategories[0]?.id || '',
        );
      } catch (loadError) {
        setFormError(getReadableError(loadError, 'Unable to load categories.'));
      }
    }

    void loadCategories();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );
  const productSlug = slug || slugify(name);
  const totalImages = variants.reduce(
    (total, variant) => total + variant.images.length,
    0,
  );

  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
    setUploadErrors((current) => ({ ...current, [index]: '' }));
  };

  const removeVariantImage = (variantIndex: number, imageKey: string) => {
    setVariants((current) =>
      current.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              images: variant.images.filter(
                (image) => (image.publicId ?? image.url) !== imageKey,
              ),
            }
          : variant,
      ),
    );
  };

  const handleCreateCategory = async () => {
    setCategoryError(null);

    if (!newCategoryName.trim()) {
      setCategoryError('Enter a category name first.');
      return;
    }

    try {
      setIsCreatingCategory(true);
      const category = await createAdminCategory({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName),
        description: newCategoryDescription.trim() || undefined,
      });
      setCategories((current) => [...current, category]);
      setCategoryId(category.id);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (createError) {
      setCategoryError(getReadableError(createError, 'Unable to create category.'));
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleUploadImages = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    const variant = variants[index];
    const validationError = validateImageFiles(files, variant.images.length);

    if (validationError) {
      setUploadErrors((current) => ({ ...current, [index]: validationError }));
      return;
    }

    if (!selectedCategory?.slug || !productSlug || !variant.colorSlug) {
      setUploadErrors((current) => ({
        ...current,
        [index]: 'Choose a category, product slug, and color slug before upload.',
      }));
      return;
    }

    try {
      setUploadingIndex(index);
      setFormError(null);
      setUploadErrors((current) => ({ ...current, [index]: '' }));
      const images = await uploadProductImages({
        files,
        categorySlug: selectedCategory.slug,
        productSlug,
        colorSlug: variant.colorSlug,
      });
      updateVariant(index, {
        images: [...variant.images, ...images].slice(0, MAX_IMAGES_PER_COLOR),
      });
    } catch (uploadError) {
      setUploadErrors((current) => ({
        ...current,
        [index]: getReadableError(uploadError, 'Upload failed.'),
      }));
    } finally {
      setUploadingIndex(null);
    }
  };

  const validateProduct = () => {
    if (!name.trim()) {
      return 'Product name is required.';
    }

    if (!productSlug) {
      return 'Product slug is required.';
    }

    if (!categoryId) {
      return 'Choose or create a category.';
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      return 'Enter a valid product price.';
    }

    const invalidVariant = variants.find(
      (variant) =>
        !variant.colorName.trim() ||
        !variant.colorSlug.trim() ||
        !variant.size.trim() ||
        !Number.isFinite(Number(variant.stock)) ||
        Number(variant.stock) < 0,
    );

    if (invalidVariant) {
      return 'Each variant needs color, size, and valid stock.';
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const validationError = validateProduct();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: productSlug,
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
      };
      const savedProduct = product
        ? await updateAdminProduct(product.id, payload)
        : await createAdminProduct(payload);

      setSuccess(product ? 'Product updated.' : 'Product created.');
      router.push(
        product
          ? `/admin/products?updated=${savedProduct.id}`
          : `/admin/products?created=${savedProduct.id}`,
      );
      router.refresh();
    } catch (submitError) {
      setFormError(
        getReadableError(
          submitError,
          product ? 'Unable to update product.' : 'Unable to create product.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-8">
        <div className="border border-[#e5e5e5] bg-white p-5 sm:p-7">
          <div className="mb-7 flex flex-col gap-3 border-b border-[#eeeeee] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
                Product setup
              </p>
              <h2 className="mt-2 text-2xl font-light">Core product details</h2>
            </div>
            <p className="text-sm text-[#666666]">
              Slug preview: {productSlug || 'product-slug'}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextInput label="Name" value={name} onChange={setName} />
            </div>
            <TextInput
              label="Slug"
              value={slug}
              placeholder={slugify(name)}
              onChange={(value) => setSlug(slugify(value))}
            />
            <TextInput
              label="Price INR"
              value={price}
              inputMode="decimal"
              onChange={setPrice}
            />
            <label className="block">
              <FieldLabel>Category</FieldLabel>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 w-full cursor-pointer border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
              >
                {categories.length === 0 && <option value="">No categories</option>}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Status</FieldLabel>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as AdminProductStatus)}
                className="h-11 w-full cursor-pointer border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-32 w-full border border-[#d9d9d9] px-4 py-3 text-sm leading-6 outline-none focus:border-[#111111]"
              />
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
                Variants
              </p>
              <h2 className="mt-2 text-2xl font-light">Colors, sizes, and stock</h2>
            </div>
            <button
              type="button"
              onClick={() => setVariants((current) => [...current, emptyVariant()])}
              className="h-11 cursor-pointer border border-[#111111] px-5 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
            >
              Add variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="border border-[#e5e5e5] bg-white p-5 sm:p-7">
              <div className="mb-6 flex flex-col gap-3 border-b border-[#eeeeee] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className="h-9 w-9 border border-[#d9d9d9]"
                    style={{ backgroundColor: variant.colorHex || '#ffffff' }}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
                      Variant {index + 1}
                    </p>
                    <p className="mt-1 text-lg">{variant.colorName || 'New color'}</p>
                  </div>
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((_, variantIndex) => variantIndex !== index),
                      )
                    }
                    className="cursor-pointer text-sm underline-offset-4 hover:underline"
                  >
                    Remove variant
                  </button>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <TextInput
                  label="Color name"
                  value={variant.colorName}
                  onChange={(value) =>
                    updateVariant(index, {
                      colorName: value,
                      colorSlug: slugify(value),
                    })
                  }
                />
                <TextInput
                  label="Color slug"
                  value={variant.colorSlug}
                  onChange={(value) => updateVariant(index, { colorSlug: slugify(value) })}
                />
                <TextInput
                  label="Color hex"
                  value={variant.colorHex}
                  placeholder="#111111"
                  onChange={(value) => updateVariant(index, { colorHex: value })}
                />
                <TextInput
                  label="Size"
                  value={variant.size}
                  onChange={(value) => updateVariant(index, { size: value })}
                />
                <TextInput
                  label="Stock"
                  value={variant.stock}
                  inputMode="numeric"
                  onChange={(value) => updateVariant(index, { stock: value })}
                />
                <TextInput
                  label="SKU"
                  value={variant.sku}
                  onChange={(value) => updateVariant(index, { sku: value })}
                />
              </div>

              <div className="mt-7 border-t border-[#eeeeee] pt-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                      Images for {variant.colorName || 'this color'}
                    </p>
                    <p className="mt-2 text-sm text-[#555555]">
                      Upload up to 5 images for this color.
                    </p>
                  </div>
                  <p className="text-sm text-[#555555]">
                    {variant.images.length}/{MAX_IMAGES_PER_COLOR} uploaded
                  </p>
                </div>

                <label
                  className={`flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition ${
                    uploadingIndex === index
                      ? 'border-[#111111] bg-[#fafafa]'
                      : 'border-[#cfcfcf] hover:border-[#111111]'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    disabled={uploadingIndex === index}
                    onChange={(event) => void handleUploadImages(index, event)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium uppercase tracking-[0.1em]">
                    {uploadingIndex === index ? 'Uploading images' : 'Choose images'}
                  </span>
                  <span className="mt-3 max-w-md text-sm leading-6 text-[#666666]">
                    JPG, JPEG, PNG, or WEBP. Max 5MB each. Multiple selection is
                    supported.
                  </span>
                </label>

                {uploadErrors[index] && (
                  <p className="mt-3 text-sm leading-6 text-[#8a1f1f]">
                    {uploadErrors[index]}
                  </p>
                )}

                {variant.images.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {variant.images.map((image, imageIndex) => (
                      <div key={image.publicId ?? image.url} className="group">
                        <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
                          <img
                            src={image.url}
                            alt={image.altText ?? 'Product image'}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                          <span className="uppercase tracking-[0.14em] text-[#777777]">
                            {imageIndex === 0 ? 'Primary' : `Image ${imageIndex + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantImage(index, image.publicId ?? image.url)
                            }
                            className="cursor-pointer underline-offset-4 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit border border-[#e5e5e5] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          {isEditMode ? 'Update checklist' : 'Publish checklist'}
        </p>
        <div className="mt-5 space-y-3 border-b border-[#eeeeee] pb-5 text-sm text-[#555555]">
          <p>Name: {name.trim() ? 'Ready' : 'Missing'}</p>
          <p>Category: {selectedCategory?.name ?? 'Missing'}</p>
          <p>Variants: {variants.length}</p>
          <p>Images: {totalImages}</p>
          <p>Status: {status}</p>
        </div>

        <div className="mt-5 border-b border-[#eeeeee] pb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
            Quick category
          </p>
          <div className="mt-4 space-y-3">
            <input
              value={newCategoryName}
              onChange={(event) => {
                setNewCategoryName(event.target.value);
                setCategoryError(null);
              }}
              placeholder="Category name"
              className="h-11 w-full border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#111111]"
            />
            <input
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              placeholder="Description optional"
              className="h-11 w-full border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#111111]"
            />
            <button
              type="button"
              disabled={isCreatingCategory}
              onClick={handleCreateCategory}
              className="h-11 w-full cursor-pointer border border-[#111111] px-4 text-sm uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#d9d9d9] disabled:text-[#777777] disabled:hover:bg-white"
            >
              {isCreatingCategory ? 'Adding category' : 'Add category'}
            </button>
            {categoryError && (
              <p className="text-sm leading-6 text-[#8a1f1f]">{categoryError}</p>
            )}
          </div>
        </div>

        {formError && (
          <p className="mt-5 border border-[#8a1f1f] p-4 text-sm leading-6 text-[#8a1f1f]">
            {formError}
          </p>
        )}
        {success && (
          <p className="mt-5 border border-[#1f6b3a] p-4 text-sm leading-6 text-[#1f6b3a]">
            {success}
          </p>
        )}
        <button
          disabled={isSubmitting}
          className="mt-6 h-12 w-full cursor-pointer border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#d9d9d9] disabled:text-[#777777] disabled:hover:bg-white"
        >
          {isSubmitting
            ? isEditMode
              ? 'Updating product'
              : 'Creating product'
            : isEditMode
              ? 'Update product'
              : 'Create product'}
        </button>
      </aside>
    </form>
  );
}
