import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Size Guide',
  description:
    'Find your perfect fit with the AEVRO size guide — detailed measurements and fit advice for all trouser styles.',
  path: '/help/size-guide',
});

const measurements = [
  { size: '28', waist: '71 cm / 28″', hip: '89 cm / 35″', inseam: '77 cm / 30.3″' },
  { size: '30', waist: '76 cm / 30″', hip: '94 cm / 37″', inseam: '78 cm / 30.7″' },
  { size: '32', waist: '81 cm / 32″', hip: '99 cm / 39″', inseam: '79 cm / 31.1″' },
  { size: '34', waist: '86 cm / 34″', hip: '104 cm / 41″', inseam: '80 cm / 31.5″' },
  { size: '36', waist: '91 cm / 36″', hip: '109 cm / 43″', inseam: '80 cm / 31.5″' },
];

export default function SizeGuidePage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Help
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Size Guide
            </h1>
            <p className="mt-8 max-w-[520px] text-sm leading-7 text-[#3f3932]">
              All AEVRO trousers are designed with a tailored fit through the waist
              and a gentle taper to the ankle. If you are between sizes, we
              recommend sizing up for a more relaxed fit.
            </p>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#514c45]">
            Trouser Measurements
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm text-[#3f3932]">
              <thead>
                <tr className="border-b border-[#ddd4c8] text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]">
                  <th className="pb-4 pr-8">Size</th>
                  <th className="pb-4 pr-8">Waist</th>
                  <th className="pb-4 pr-8">Hip</th>
                  <th className="pb-4">Inseam</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((row) => (
                  <tr key={row.size} className="border-b border-[#ddd4c8]/60">
                    <td className="py-4 pr-8 font-medium text-[#111111]">{row.size}</td>
                    <td className="py-4 pr-8">{row.waist}</td>
                    <td className="py-4 pr-8">{row.hip}</td>
                    <td className="py-4">{row.inseam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[520px] space-y-4 text-sm leading-7 text-[#514c45]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
              How to Measure
            </h2>
            <p>
              <strong className="text-[#111111]">Waist:</strong> Measure around your
              natural waistline, where you would normally wear your trousers.
            </p>
            <p>
              <strong className="text-[#111111]">Hip:</strong> Measure around the
              fullest part of your hips.
            </p>
            <p>
              <strong className="text-[#111111]">Inseam:</strong> Measure from the
              crotch seam to the bottom of the leg on a pair of trousers that fit
              you well.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
            >
              Need help? Contact us
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
