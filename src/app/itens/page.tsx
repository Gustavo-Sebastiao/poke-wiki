import { getItems } from '@/lib/itemService';
import ItemsList from '@/components/ItemsList';

export default async function ItensPage() {
  const items = await getItems();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-6 pt-24 pb-8">
      <ItemsList initialItems={items} />
    </div>
  );
}
