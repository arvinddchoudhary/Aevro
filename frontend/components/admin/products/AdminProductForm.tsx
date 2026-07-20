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
import { AdminIcon } from '../AdminIcons';

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

const COLOR_HEX_BY_NAME: Record<string, string> = {
  beige: '#D8C8A8',
  black: '#111111',
  blue: '#1F4E79',
  brown: '#6B4F3A',
  charcoal: '#36454F',
  cream: '#F5F1E8',
  green: '#2F6B4F',
  grey: '#808080',
  gray: '#808080',
  khaki: '#C3B091',
  maroon: '#800000',
  navy: '#0B1F3A',
  olive: '#708238',
  onyx: '#111111',
  pink: '#D8A7B1',
  purple: '#6D4C8D',
  red: '#B22222',
  tan: '#D2B48C',
  white: '#FFFFFF',
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

function normalizeColorName(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getHexForColorName(value: string) {
  return COLOR_HEX_BY_NAME[normalizeColorName(value)];
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

function normalizeImageOrder(images: UploadedProductImage[]) {
  return images.map((image, sortOrder) => ({
    ...image,
    sortOrder,
    isPrimary: sortOrder === 0,
  }));
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#625a51]">
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
        className="h-11 w-full rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
      />
    </label>
  );
}

function ColorHexInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#111111';

  return (
    <label className="block">
      <FieldLabel>Color hex</FieldLabel>
      <div className="grid grid-cols-[52px_1fr]">
        <input
          type="color"
          value={safeColor}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-11 w-full cursor-pointer border border-r-0 border-[#ddd4c8] bg-[#fffaf3] p-1"
          aria-label="Pick variant color"
        />
        <input
          value={value}
          placeholder="#111111"
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-r-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
        />
      </div>
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
    images: normalizeImageOrder(
      variant.images.map((image, index) => ({
        url: image.url,
        publicId: image.publicId,
        altText: image.altText ?? undefined,
        sortOrder: image.sortOrder ?? index,
        isPrimary: image.isPrimary ?? index === 0,
      })),
    ),
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
  const [draggedImage, setDraggedImage] = useState<{
    variantIndex: number;
    imageIndex: number;
  } | null>(null);

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
  const primaryImage = variants.flatMap((variant) => variant.images)[0];

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
              images: normalizeImageOrder(
                variant.images.filter(
                  (image) => (image.publicId ?? image.url) !== imageKey,
                ),
              ),
            }
          : variant,
      ),
    );
  };

  const moveVariantImage = (
    variantIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => {
    setVariants((current) =>
      current.map((variant, index) => {
        if (
          index !== variantIndex ||
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= variant.images.length ||
          toIndex >= variant.images.length
        ) {
          return variant;
        }

        const images = [...variant.images];
        const [movedImage] = images.splice(fromIndex, 1);
        images.splice(toIndex, 0, movedImage);
        return { ...variant, images: normalizeImageOrder(images) };
      }),
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
        images: normalizeImageOrder(
          [...variant.images, ...images].slice(0, MAX_IMAGES_PER_COLOR),
        ),
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
    <form
      onSubmit={handleSubmit}
      className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <section className="space-y-5">
        <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.035)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
            Core product details
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextInput
                label="Name"
                value={name}
                placeholder="Enter product name"
                onChange={setName}
              />
            </div>
            <TextInput
              label="Slug"
              value={slug}
              placeholder="Enter slug (e.g. linen-trousers)"
              onChange={(value) => setSlug(slugify(value))}
            />
            <TextInput
              label="Price INR"
              value={price}
              placeholder="Enter price (INR)"
              inputMode="decimal"
              onChange={setPrice}
            />
            <label className="block">
              <FieldLabel>Category</FieldLabel>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 w-full cursor-pointer rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
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
                className="h-11 w-full cursor-pointer rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={description}
                placeholder="Describe the product, fabric, fit, and other key details..."
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 w-full rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-4 py-3 text-sm leading-6 outline-none focus:border-[#111111]"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.03)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
                Color variants
              </p>
              <p className="mt-3 text-sm leading-6 text-[#625a51]">
                Add colorways, size, and stock for this product.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {variants.map((variant, index) => (
                <article
                  key={index}
                  className="relative rounded-[6px] border border-[#e1d8cc] bg-[#fffdf8] p-4"
                >
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariants((current) =>
                          current.filter((_, variantIndex) => variantIndex !== index),
                        )
                      }
                      className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#ddd4c8] bg-[#fffaf3] text-xs"
                      aria-label="Remove variant"
                    >
                      ×
                    </button>
                  )}
                  <span
                    className="block h-16 rounded-[4px] border border-[#ddd4c8]"
                    style={{ backgroundColor: variant.colorHex || '#ffffff' }}
                  />
                  <div className="mt-4 grid gap-3">
                    <TextInput
                      label="Color name"
                      value={variant.colorName}
                      onChange={(value) => {
                        const matchedHex = getHexForColorName(value);

                        updateVariant(index, {
                          colorName: value,
                          colorSlug: slugify(value),
                          ...(matchedHex ? { colorHex: matchedHex } : {}),
                        });
                      }}
                    />
                    <ColorHexInput
                      value={variant.colorHex}
                      onChange={(value) => updateVariant(index, { colorHex: value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>
                    <TextInput
                      label="SKU"
                      value={variant.sku}
                      onChange={(value) => updateVariant(index, { sku: value })}
                    />
                  </div>
                </article>
              ))}
              <button
                type="button"
                onClick={() => setVariants((current) => [...current, emptyVariant()])}
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed border-[#bfb2a4] bg-[#fffdf8] p-5 text-sm transition hover:border-[#111111]"
              >
                <AdminIcon name="plus" className="h-5 w-5" />
                <span className="mt-3">Add color</span>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.03)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
                Product images
              </p>
              <p className="mt-3 text-sm leading-6 text-[#625a51]">
                Upload images for each color. Drag to arrange them; the first image is the primary product image. Recommended: 1080x1350px or higher.
              </p>
            </div>
            <div className="space-y-5">
              {variants.map((variant, index) => (
                <div key={index}>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[#111111]">
                      {variant.colorName || `Variant ${index + 1}`}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#77716a]">
                      {variant.images.length}/{MAX_IMAGES_PER_COLOR}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <label
                      className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[6px] border border-dashed px-4 py-5 text-center transition ${
                        uploadingIndex === index
                          ? 'border-[#111111] bg-[#f5efe6]'
                          : 'border-[#c8bcae] bg-[#fffdf8] hover:border-[#111111]'
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
                      <AdminIcon name="upload" className="h-6 w-6" />
                      <span className="mt-3 text-xs font-medium">
                        {uploadingIndex === index ? 'Uploading' : 'Upload images'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
                      {variant.images.map((image, imageIndex) => (
                        <div
                          key={image.publicId ?? image.url}
                          draggable
                          onDragStart={() => setDraggedImage({ variantIndex: index, imageIndex })}
                          onDragOver={(event) => {
                            if (draggedImage?.variantIndex === index) event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggedImage?.variantIndex === index) {
                              moveVariantImage(index, draggedImage.imageIndex, imageIndex);
                            }
                            setDraggedImage(null);
                          }}
                          onDragEnd={() => setDraggedImage(null)}
                          className={`group relative aspect-square cursor-grab overflow-hidden rounded-[6px] bg-[#f5f0e8] active:cursor-grabbing ${
                            draggedImage?.variantIndex === index && draggedImage.imageIndex === imageIndex
                              ? 'opacity-50 ring-2 ring-[#111111] ring-offset-2'
                              : ''
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.altText ?? 'Product image'}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantImage(index, image.publicId ?? image.url)
                            }
                            className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#fffaf3] text-xs shadow"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                          <span className="absolute left-2 top-2 rounded-full bg-[#111111]/75 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                            {imageIndex === 0 ? 'Primary' : imageIndex + 1}
                          </span>
                          <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                            <button
                              type="button"
                              onClick={() => moveVariantImage(index, imageIndex, imageIndex - 1)}
                              disabled={imageIndex === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fffaf3] text-sm shadow disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Move image ${imageIndex + 1} earlier`}
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVariantImage(index, imageIndex, imageIndex + 1)}
                              disabled={imageIndex === variant.images.length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fffaf3] text-sm shadow disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Move image ${imageIndex + 1} later`}
                            >
                              →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {uploadErrors[index] && (
                    <p className="mt-3 text-sm leading-6 text-[#8a1f1f]">
                      {uploadErrors[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.04)] sm:p-6 xl:sticky xl:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
          {isEditMode ? 'Update checklist' : 'Publish checklist'}
        </p>
        <div className="mt-5 space-y-4 border-b border-[#e7ded2] pb-5 text-sm text-[#514c45]">
          {[
            ['Name', name.trim() ? name.trim() : '—'],
            ['Category', selectedCategory?.name ?? '—'],
            ['Variants', String(variants.length)],
            ['Images', String(totalImages)],
            ['Status', status.charAt(0) + status.slice(1).toLowerCase()],
          ].map(([label, value], index) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eee7dd]">
                <AdminIcon
                  name={index === 0 ? 'box' : index === 1 ? 'product' : index === 3 ? 'upload' : 'shield'}
                  className="h-4 w-4"
                />
              </span>
              <span>{label}: </span>
              <span className="ml-auto text-[#111111]">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 border-b border-[#e7ded2] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56f3c]">
            Product preview
          </p>
          <div className="mt-4 overflow-hidden rounded-[6px] border border-[#e1d8cc] bg-[#fffdf8]">
            <div className="aspect-[16/10] bg-[#f6f0e8]">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={primaryImage.altText ?? name ?? 'Product preview'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#d8cfc2]">
                  <AdminIcon name="product" className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 font-serif text-lg text-[#111111]">
            {name || 'Product name'}
          </p>
          <p className="mt-1 text-sm text-[#111111]">₹{price || '0'} INR</p>
        </div>

        <div className="mt-5 border-b border-[#e7ded2] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56f3c]">
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
              className="h-11 w-full rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-3 text-sm outline-none focus:border-[#111111]"
            />
            <input
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              placeholder="Description optional"
              className="h-11 w-full rounded-[3px] border border-[#ddd4c8] bg-[#fffdf8] px-3 text-sm outline-none focus:border-[#111111]"
            />
            <button
              type="button"
              disabled={isCreatingCategory}
              onClick={handleCreateCategory}
              className="h-11 w-full cursor-pointer rounded-[3px] bg-[#111111] px-4 text-sm uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2d2924] disabled:cursor-not-allowed disabled:bg-[#ddd4c8]"
              style={{ color: '#fffaf3' }}
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
          className="mt-6 h-12 w-full cursor-pointer rounded-[3px] bg-[#111111] text-sm font-medium uppercase tracking-[0.12em] text-[#fffaf3] hover:bg-[#2d2924] disabled:cursor-not-allowed disabled:bg-[#ddd4c8]"
          style={{ color: '#fffaf3' }}
        >
          {isSubmitting
            ? isEditMode
              ? 'Updating product'
              : 'Creating product'
            : isEditMode
              ? 'Update product'
              : 'Create product'}
        </button>
        <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#625a51]">
          <AdminIcon name="shield" className="h-4 w-4" />
          You can edit and publish this product later.
        </p>
      </aside>
    </form>
  );
}
