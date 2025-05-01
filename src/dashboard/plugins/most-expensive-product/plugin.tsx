import React, { useEffect, useState, type FC } from 'react';
import type { plugins } from '@wix/stores/dashboard';
import {
  WixDesignSystemProvider,
  Card,
  Text,
  Button,
  Image,
  Box,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import '@wix/design-system/styles.global.css';
import { dashboard } from '@wix/dashboard';
import { products } from '@wix/stores';

const Plugin: FC<plugins.Products.ProductsBannerParams> = () => {
  const [product, setProduct] = useState<Product | null>(null);

  const fetchMostExpensiveNonDiscountedProduct = async () => {
    try {
      const result = await products.queryProducts().limit(50).find();

      const nonDiscounted = result.items.filter(
        (p) => p.discount?.type === 'NONE' || !p.discount
      );

      if (!nonDiscounted.length) {
        setProduct({
          id: '',
          name: 'No product found',
          price: 0,
          imageUrl: '',
        });
        return;
      }

      const mostExpensive = nonDiscounted.reduce((max, curr) =>
        (curr.priceData?.price || 0) > (max.priceData?.price || 0) ? curr : max
      );

      const imageUrl =
        mostExpensive.media?.mainMedia?.image?.url ||
        (mostExpensive.media?.items?.[0] as any)?.image?.url ||
        (mostExpensive.media?.items?.[0] as any)?.url ||
        '';

      setProduct({
        id: mostExpensive._id || '',
        name: mostExpensive.name || 'Unnamed product',
        price: mostExpensive.priceData?.price || 0,
        imageUrl,
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setProduct({
        id: '',
        name: 'Error loading product',
        price: 0,
        imageUrl: '',
      });
    }
  };

  useEffect(() => {
    fetchMostExpensiveNonDiscountedProduct();
  }, []);

  useEffect(() => {
    const subscription = dashboard.observeState(() => {
      fetchMostExpensiveNonDiscountedProduct();
    });
    return () => subscription.disconnect();
  }, []);

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Card>
        <Card.Header title="Most expensive product" />
        <Card.Divider />
        <Card.Content>
          <Box align="center" verticalAlign="middle" gap="12px">
            <Image
              width="60px"
              height="60px"
              src={product?.imageUrl}
              style={{ borderRadius: '8px' }}
            />
            <Text size="tiny">
              <Text weight="bold">{product?.name || 'Loading...'}:</Text> {product?.price?.toFixed(2)} ₪
            </Text>
            <Box flexGrow={1} />
            <Button
              size="tiny"
              priority="primary"
              prefixIcon={<Icons.Discount />}
              onClick={() => {
                if (!product) return;
                dashboard.navigate({
                  pageId: '90f070d1-e3c0-4249-b3bb-3ea00cf61840',
                  relativeUrl: `?productId=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price}&imageUrl=${encodeURIComponent(product.imageUrl)}`
                });
              }}
            >
              Discount me!
            </Button>
          </Box>
        </Card.Content>
      </Card>
    </WixDesignSystemProvider>
  );
};

export default Plugin;

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};