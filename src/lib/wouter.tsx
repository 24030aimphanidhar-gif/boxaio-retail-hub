/**
 * Thin compatibility layer that maps the legacy `wouter` API used across the
 * BOXAIO pages onto TanStack Router. Aliased as "wouter" in vite/tsconfig so
 * existing page code keeps working without a second router.
 */
import { useRouter, useRouterState, useParams as useTanStackParams } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  to?: string;
  replace?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, to, replace, onClick, children, ...rest },
  ref,
) {
  const router = useRouter();
  const target = href ?? to ?? "/";

  return (
    <a
      ref={ref}
      href={target}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.button !== 0 || isModifiedEvent(event) || rest.target === "_blank") return;
        if (/^(https?:)?\/\//.test(target) || target.startsWith("mailto:") || target.startsWith("tel:"))
          return;
        event.preventDefault();
        void router.navigate({ href: target, replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export type NavigateFn = (href: string, options?: { replace?: boolean }) => void;

export function useLocation(): [string, NavigateFn] {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navigate: NavigateFn = (href, options) => {
    void router.navigate({ href, replace: options?.replace });
  };

  return [pathname, navigate];
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useRouterState({
    select: (s) => (s.matches[s.matches.length - 1]?.params ?? {}) as T,
  });
}

export function useSearchParams(): URLSearchParams {
  const search = useRouterState({ select: (s) => s.location.searchStr });
  return new URLSearchParams(search);
}

export function Redirect({ href, to }: { href?: string; to?: string }) {
  const router = useRouter();
  const target = href ?? to ?? "/";
  void router.navigate({ href: target, replace: true });
  return null;
}
