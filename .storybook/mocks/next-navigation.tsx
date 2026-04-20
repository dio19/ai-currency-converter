/**
 * Mock for next/navigation
 * Used to avoid "invariant expected app router to be mounted" error in Storybook with Vite builder.
 */

export const useRouter = () => ({
  push: (url: string) => console.log(`[Router] push to ${url}`),
  replace: (url: string) => console.log(`[Router] replace to ${url}`),
  prefetch: () => {},
  back: () => console.log('[Router] back'),
  forward: () => console.log('[Router] forward'),
  refresh: () => console.log('[Router] refresh'),
});

export const usePathname = () => '/';

export const useSearchParams = () => {
  return new URLSearchParams();
};

export const useParams = () => {
  return {};
};

export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];

export default {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
};
