import React, { useEffect, useState, type FC } from 'react';
import { dashboard } from '@wix/dashboard';
import {
  Button,
  EmptyState,
  Image,
  Page,
  Input,
  WixDesignSystemProvider,
  Box,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import { products } from '@wix/stores';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const Index: FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [discount, setDiscount] = useState('');

  const applyDiscount = async () => {
    const value = parseFloat(discount);

    if (!discount) {
      dashboard.showToast({ message: 'Please enter a discount.' });
      return;
    }

    if (isNaN(value) || value <= 0 || value > 100) {
      dashboard.showToast({ message: 'Discount must be a number between 0 and 100.' });
      return;
    }

    if (!product?.id) {
      dashboard.showToast({ message: 'Product ID missing.' });
      return;
    } 
    try {
      const updatedProduct = await products.updateProduct(product.id, {
        discount: {
          type: 'PERCENT' as any, // Fallback to "as any" if DiscountType is not exported
          value: value,
        },
      });
      console.log('Product discount updated successfully:', updatedProduct);
      dashboard.showToast({ message: 'Discount applied successfully!' });
      
    } catch (err) {
      console.error('Error applying discount:', err);
      dashboard.showToast({ message: 'Error applying discount.' });
    }
  };

  useEffect(() => {
    dashboard.observeState((componentParams: any) => {
      const { search } = componentParams.location || {};
      const queryParams = new URLSearchParams(search);

      const productFromUrl: Product = {
        id: queryParams.get('productId') || '',
        name: queryParams.get('name') || 'Unknown',
        price: parseFloat(queryParams.get('price') || '0'),
        imageUrl: queryParams.get('imageUrl') || '',
      };

      if (!productFromUrl.id) {
        dashboard.showToast({ message: 'Product info not found in URL' });
        return;
      }

      setProduct(productFromUrl);
    });
  }, []);

  

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Page>
        <Page.Header
          title="Product Discount Page"
          subtitle="Discount the most expensive product"
        />
        <Page.Content>
          <EmptyState
            image={
              <Image
                fit="contain"
                height="150px"
                src={product?.imageUrl || ''}
                transparent
              />
            }
            title={product?.name || 'Loading...'}
            subtitle={
              product
                ? `Current Price: ₪${product.price.toFixed(2)}`
                : 'Fetching price...'
            }
            theme="page"
          >
            <Box direction="vertical" gap="8px" width={230}>
              <Input
                placeholder="Enter discount percentage"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    e.target.value
                      .replace(/[^0-9.]/g, '')
                      .replace(/(\..*)\./g, '$1') // avoid second dot
                  )
                }
                size="small"
              />
              <Button onClick={applyDiscount} prefixIcon={<Icons.GetStarted />}>
                Apply Discount
              </Button>
            </Box>
          </EmptyState>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default Index;