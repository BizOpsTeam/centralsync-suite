import { PlaceholderPage } from "./PlaceholderPage";

export default function Products() {
  return (
    <PlaceholderPage
      title="Product Management"
      description="Manage your product catalog, inventory, and categories"
      features={[
        "Product catalog with images and descriptions",
        "Inventory management and stock tracking",
        "Category and variant organization",
        "Barcode/QR code generation",
        "Low stock alerts and notifications",
        "Bulk product operations",
        "Price management and promotions",
        "Product performance analytics"
      ]}
    />
  );
}