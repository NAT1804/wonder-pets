import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Dogs',
      slug: 'dogs',
      description: 'Puppies, dog food, and daily essentials for dogs.',
    },
    {
      name: 'Cats',
      slug: 'cats',
      description: 'Kittens, cat food, litter, and toys for cats.',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Collars, leashes, carriers, and grooming tools.',
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap.set(record.slug, record.id);
  }

  const dogsCategoryId = categoryMap.get('dogs');
  const catsCategoryId = categoryMap.get('cats');
  const accessoriesCategoryId = categoryMap.get('accessories');

  if (!dogsCategoryId || !catsCategoryId || !accessoriesCategoryId) {
    throw new Error('Failed to seed required categories');
  }

  const products = [
    {
      name: 'Royal Canin Medium Adult 4kg',
      slug: 'royal-canin-medium-adult-4kg',
      description: 'Complete dry dog food formulated for medium breed adult dogs.',
      price: '650000.00',
      stock: 25,
      images: [],
      categoryId: dogsCategoryId,
    },
    {
      name: 'Me-O Tuna Adult Cat Food 1.2kg',
      slug: 'me-o-tuna-adult-cat-food-1-2kg',
      description: 'Nutritious tuna-flavored dry food for adult cats.',
      price: '135000.00',
      stock: 40,
      images: [],
      categoryId: catsCategoryId,
    },
    {
      name: 'Breathable Pet Carrier Backpack',
      slug: 'breathable-pet-carrier-backpack',
      description: 'Lightweight ventilated backpack suitable for small dogs and cats.',
      price: '420000.00',
      stock: 15,
      images: [],
      categoryId: accessoriesCategoryId,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
      },
      create: product,
    });
  }

  console.log('Seeded categories and sample products successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
