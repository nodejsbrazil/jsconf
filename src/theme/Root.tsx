import { RootProvider } from '@site/src/components/contexts/Root';

export default function Root({ children }: { children: React.ReactNode }) {
  return <RootProvider>{children}</RootProvider>;
}
