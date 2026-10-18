import { Outlet } from 'react-router-dom';
import { MarketingLayout as BaseMarketingLayout } from '@/components/layout';

export default function MarketingLayout() {
  return (
    <BaseMarketingLayout>
      <Outlet />
    </BaseMarketingLayout>
  );
}
