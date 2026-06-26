'use client';

import { useEffect, useState } from 'react';
import {
  createHomepageSection,
  deleteHomepageSection,
  getAdminHomepageSections,
  updateHomepageSection,
  updateHomepageSectionStatus,
  type CreateHomepageSectionInput,
} from '../../../lib/api/homepage';
import type { HomepageSection } from '../../../types/homepage';
import { AdminRouteGuard } from '../AdminRouteGuard';
import { HomepageSectionForm } from './HomepageSectionForm';

function formatSectionType(type: HomepageSection['type']) {
  return type.replaceAll('_', ' ');
}

export function AdminHomepagePageContent() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [editingSection, setEditingSection] = useState<HomepageSection | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadSections() {
    setStatus('loading');
    setMessage('');

    try {
      const data = await getAdminHomepageSections();
      setSections(data);
      setStatus('ready');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not load homepage sections.',
      );
      setStatus('error');
    }
  }

  useEffect(() => {
    void loadSections();
  }, []);

  function startCreate() {
    setEditingSection(undefined);
    setShowForm(true);
    setMessage('');
  }

  function startEdit(section: HomepageSection) {
    setEditingSection(section);
    setShowForm(true);
    setMessage('');
  }

  async function handleSubmit(payload: CreateHomepageSectionInput) {
    setIsSubmitting(true);
    setMessage('');

    try {
      if (editingSection) {
        await updateHomepageSection(editingSection.id, payload);
        setMessage('Homepage section updated.');
      } else {
        await createHomepageSection(payload);
        setMessage('Homepage section created.');
      }

      setShowForm(false);
      setEditingSection(undefined);
      await loadSections();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save homepage section.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(section: HomepageSection) {
    setMessage('');

    try {
      await updateHomepageSectionStatus(section.id, !section.isActive);
      await loadSections();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not update section status.',
      );
    }
  }

  async function removeSection(section: HomepageSection) {
    setMessage('');

    try {
      await deleteHomepageSection(section.id);
      await loadSections();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not delete homepage section.',
      );
    }
  }

  return (
    <AdminRouteGuard>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ddd4c8] pb-6 sm:pb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
                Admin
              </p>
              <h1 className="mt-4 text-3xl font-light sm:text-4xl md:text-5xl">
                Homepage CMS
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5a53]">
                Manage hero banners, featured products, lookbook blocks, and
                campaign sections shown on the public homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="h-12 w-full cursor-pointer border border-[#111111] px-6 text-xs font-medium uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-[#fffaf3] sm:w-auto"
            >
              New section
            </button>
          </div>

          {message ? (
            <div className="mt-6 border border-[#ddd4c8] bg-[#fffaf3] px-4 py-3 text-sm text-[#514c45]">
              {message}
            </div>
          ) : null}

          {showForm ? (
            <div className="mt-8">
              <HomepageSectionForm
                section={editingSection}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingSection(undefined);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          ) : null}

          <div className="mt-8 space-y-4">
            {status === 'loading' ? (
              <div className="border border-[#ddd4c8] p-8 text-sm text-[#5f5a53]">
                Loading homepage sections.
              </div>
            ) : null}

            {status === 'error' ? (
              <div className="border border-[#9f1d1d] p-8 text-sm text-[#9f1d1d]">
                {message || 'Could not load homepage sections.'}
              </div>
            ) : null}

            {status === 'ready' && sections.length === 0 ? (
              <div className="border border-[#ddd4c8] p-8 text-sm text-[#5f5a53]">
                No homepage sections yet. The public homepage will use fallback
                content until active sections are added.
              </div>
            ) : null}

            {sections.map((section) => (
              <article
                key={section.id}
                className="grid gap-4 border border-[#ddd4c8] bg-[#fffaf3] p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5"
              >
                {section.imageUrl ? (
                  <img
                    src={section.imageUrl}
                    alt={section.title ?? 'Homepage section'}
                    className="aspect-[4/3] w-full border border-[#ddd4c8] object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-[#ddd4c8] text-xs uppercase tracking-[0.12em] text-[#777777]">
                    No image
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="border border-[#ddd4c8] px-2 py-1 text-xs uppercase tracking-[0.12em]">
                      {formatSectionType(section.type)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.12em] text-[#777777]">
                      Order {section.sortOrder}
                    </span>
                    <span className="text-xs uppercase tracking-[0.12em] text-[#777777]">
                      {section.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-light sm:text-2xl">
                    {section.title || 'Untitled section'}
                  </h2>
                  {section.subtitle ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777777]">
                      {section.subtitle}
                    </p>
                  ) : null}
                  {section.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5a53]">
                      {section.description}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(section)}
                      className="h-10 cursor-pointer border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-[#fffaf3]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(section)}
                      className="h-10 cursor-pointer border border-[#ddd4c8] px-4 text-xs font-medium uppercase tracking-[0.12em] hover:border-[#111111]"
                    >
                      {section.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeSection(section)}
                      className="h-10 cursor-pointer border border-[#9f1d1d] px-4 text-xs font-medium uppercase tracking-[0.12em] text-[#9f1d1d]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="h-fit border border-[#ddd4c8] bg-[#fffaf3] p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
            Section guide
          </p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-[#5f5a53]">
            <p>
              Use HERO for the first homepage banner. FEATURED_PRODUCTS renders
              the current product grid with CMS heading copy.
            </p>
            <p>
              FEATURED_COLLECTION, LOOKBOOK, and CAMPAIGN_BANNER render
              editorial image sections with CTA support.
            </p>
            <p>
              Images upload through the backend Cloudinary endpoint. Secrets stay
              on the backend.
            </p>
          </div>
        </aside>
      </div>
    </AdminRouteGuard>
  );
}
