'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import type { HomepageSection, HomepageSectionType } from '../../../types/homepage';
import { uploadHomepageImage, type CreateHomepageSectionInput } from '../../../lib/api/homepage';

const SECTION_TYPES: HomepageSectionType[] = [
  'HERO',
  'FEATURED_COLLECTION',
  'FEATURED_PRODUCTS',
  'LOOKBOOK',
  'CAMPAIGN_BANNER',
];

type HomepageSectionFormProps = {
  section?: HomepageSection;
  onSubmit: (data: CreateHomepageSectionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const emptyForm = {
  type: 'HERO' as HomepageSectionType,
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  imagePublicId: '',
  ctaLabel: '',
  ctaHref: '',
  sortOrder: 0,
  isActive: true,
  metadata: '',
};

export function HomepageSectionForm({
  section,
  onSubmit,
  onCancel,
  isSubmitting,
}: HomepageSectionFormProps) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    type: section?.type ?? emptyForm.type,
    title: section?.title ?? '',
    subtitle: section?.subtitle ?? '',
    description: section?.description ?? '',
    imageUrl: section?.imageUrl ?? '',
    imagePublicId: section?.imagePublicId ?? '',
    ctaLabel: section?.ctaLabel ?? '',
    ctaHref: section?.ctaHref ?? '',
    sortOrder: section?.sortOrder ?? 0,
    isActive: section?.isActive ?? true,
    metadata: section?.metadata ? JSON.stringify(section.metadata, null, 2) : '',
  }));
  const [uploadState, setUploadState] = useState<'idle' | 'uploading'>('idle');
  const [uploadError, setUploadError] = useState('');

  function updateField(
    field: keyof typeof form,
    value: string | number | boolean | HomepageSectionType,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadState('uploading');

    try {
      const image = await uploadHomepageImage(file);
      setForm((current) => ({
        ...current,
        imageUrl: image.url,
        imagePublicId: image.publicId,
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Could not upload homepage image.',
      );
    } finally {
      setUploadState('idle');
      event.target.value = '';
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      type: form.type,
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      imagePublicId: form.imagePublicId.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
      metadata: form.metadata.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#ddd4c8] bg-[#fffaf3] p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
        {section ? 'Edit section' : 'New section'}
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Type
          </span>
          <select
            value={form.type}
            onChange={(event) =>
              updateField('type', event.target.value as HomepageSectionType)
            }
            className="mt-2 h-12 w-full cursor-pointer border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          >
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Sort order
          </span>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(event) => updateField('sortOrder', Number(event.target.value))}
            className="mt-2 h-12 w-full border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Subtitle
          </span>
          <input
            value={form.subtitle}
            onChange={(event) => updateField('subtitle', event.target.value)}
            className="mt-2 h-12 w-full border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Title
          </span>
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="mt-2 h-12 w-full border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Description
          </span>
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={4}
            className="mt-2 w-full border border-[#ddd4c8] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            CTA label
          </span>
          <input
            value={form.ctaLabel}
            onChange={(event) => updateField('ctaLabel', event.target.value)}
            className="mt-2 h-12 w-full border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            CTA href
          </span>
          <input
            value={form.ctaHref}
            onChange={(event) => updateField('ctaHref', event.target.value)}
            placeholder="/products"
            className="mt-2 h-12 w-full border border-[#ddd4c8] bg-transparent px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em]">
              Section image
            </p>
            <label className="cursor-pointer border border-[#111111] px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-[#fffaf3]">
              {uploadState === 'uploading' ? 'Uploading' : 'Upload image'}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="sr-only"
                disabled={uploadState === 'uploading'}
              />
            </label>
          </div>
          {form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt="Homepage section preview"
              className="mt-3 aspect-[16/7] w-full border border-[#ddd4c8] object-cover"
            />
          ) : (
            <div className="mt-3 flex aspect-[16/7] items-center justify-center border border-dashed border-[#ddd4c8] text-xs uppercase tracking-[0.14em] text-[#777777]">
              No image selected
            </div>
          )}
          {uploadError ? (
            <p className="mt-2 text-sm text-[#9f1d1d]">{uploadError}</p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField('isActive', event.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          Active section
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em]">
            Metadata JSON
          </span>
          <textarea
            value={form.metadata}
            onChange={(event) => updateField('metadata', event.target.value)}
            rows={3}
            placeholder='{"layout":"split"}'
            className="mt-2 w-full border border-[#ddd4c8] bg-transparent px-3 py-3 font-mono text-xs outline-none focus:border-[#111111]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 cursor-pointer border border-[#111111] bg-[#111111] px-6 text-xs font-medium uppercase tracking-[0.12em] text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving' : section ? 'Update section' : 'Create section'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 cursor-pointer border border-[#111111] px-6 text-xs font-medium uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-[#fffaf3]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
