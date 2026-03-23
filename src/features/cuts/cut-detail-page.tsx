import { Navigate, useParams, useSearchParams } from 'react-router-dom';

export function CutDetailPage() {
  const { periodEnd } = useParams();
  const [searchParams] = useSearchParams();
  const nextParams = new URLSearchParams(searchParams);

  if (periodEnd) {
    nextParams.set('period', periodEnd);
  }

  const nextSearch = nextParams.toString();

  return <Navigate to={{ pathname: '/cuts', search: nextSearch ? `?${nextSearch}` : '' }} replace />;
}
