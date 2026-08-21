const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDb = require('../db');
const User = require('../models/User');
const Food = require('../models/Food');
const Reel = require('../models/Reel');
const Like = require('../models/Like');
const Save = require('../models/Save');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');

const password = 'Password123!';

async function seed() {
  await connectDb();
  const assetsDir = path.resolve(__dirname, '../../seed/assets');
  fs.mkdirSync(env.uploadsDir, { recursive: true });
  const assets = fs.readdirSync(assetsDir).filter((asset) => /\.(png|mp4)$/i.test(asset));
  for (const asset of assets) {
    fs.copyFileSync(path.join(assetsDir, asset), path.join(env.uploadsDir, asset));
  }
  await Promise.all([
    User.deleteMany({}),
    Food.deleteMany({}),
    Reel.deleteMany({}),
    Like.deleteMany({}),
    Save.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash(password, 10);
  const partners = await User.insertMany([
    {
      name: 'Aarav Mehta',
      email: 'spice@example.com',
      passwordHash: hashedPassword,
      role: 'partner',
      business: {
        name: 'Spice Route Kitchen',
        description: 'Regional Indian comfort food with a modern finish.',
        address: '12 Market Street',
        phone: '+1 555 0101',
        cuisines: ['Indian', 'Street Food']
      }
    },
    {
      name: 'Sofia Rossi',
      email: 'pasta@example.com',
      passwordHash: hashedPassword,
      role: 'partner',
      business: {
        name: 'Ciao Pasta Bar',
        description: 'Handmade pasta and sauces prepared daily.',
        address: '88 Olive Avenue',
        phone: '+1 555 0102',
        cuisines: ['Italian', 'Pasta']
      }
    },
    {
      name: 'Noah Williams',
      email: 'green@example.com',
      passwordHash: hashedPassword,
      role: 'partner',
      business: {
        name: 'Green Table',
        description: 'Bright, seasonal bowls and plant-forward plates.',
        address: '41 Garden Road',
        phone: '+1 555 0103',
        cuisines: ['Healthy', 'Vegan']
      }
    }
  ]);
  const customers = await User.insertMany([
    { name: 'Maya Chen', email: 'maya@example.com', passwordHash: hashedPassword, role: 'customer' },
    { name: 'Liam Patel', email: 'liam@example.com', passwordHash: hashedPassword, role: 'customer' },
    { name: 'Olivia Smith', email: 'olivia@example.com', passwordHash: hashedPassword, role: 'customer' }
  ]);

  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  const menus = [
    [
      ['Chicken Tikka Masala', 'Charred chicken in a creamy tomato and fenugreek gravy.', 'Curry', 14.5],
      ['Hyderabadi Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken and saffron.', 'Biryani', 16.75],
      ['Chilli Garlic Hakka Noodles', 'Wok-tossed noodles with crisp vegetables and toasted garlic.', 'Noodles', 12.5],
      ['Paneer Kathi Roll', 'Tandoori paneer, pickled onions, and mint chutney in a flaky paratha.', 'Wraps', 10.5],
      ['Mango Saffron Kulfi', 'Silky mango kulfi finished with saffron and crushed pistachios.', 'Dessert', 7.25]
    ],
    [
      ['Truffle Mushroom Tagliatelle', 'Hand-cut pasta with wild mushrooms, parmesan, and truffle oil.', 'Pasta', 18.5],
      ['Wood-Fired Margherita Pizza', 'San Marzano tomato, fresh mozzarella, basil, and olive oil.', 'Pizza', 15.5],
      ['Burrata Panzanella', 'Toasted ciabatta, heirloom tomatoes, basil, and creamy burrata.', 'Salad', 13.75],
      ['Tuscan Tomato Basil Soup', 'Slow-simmered tomatoes, basil, garlic, and rustic focaccia.', 'Soup', 9.5],
      ['Pistachio Mascarpone Tiramisu', 'Espresso-soaked ladyfingers layered with pistachio mascarpone.', 'Dessert', 8.75]
    ],
    [
      ['Roasted Veggie Buddha Bowl', 'Quinoa, roasted seasonal vegetables, avocado, and tahini dressing.', 'Bowls', 13.5],
      ['Citrus Kale Quinoa Salad', 'Tender kale, quinoa, orange segments, seeds, and lemon dressing.', 'Salad', 12.75],
      ['Mango Matcha Smoothie', 'Mango, banana, oat milk, and ceremonial matcha blended smooth.', 'Smoothie', 8.5],
      ['Smoky Jackfruit Wrap', 'Pulled jackfruit, crunchy slaw, greens, and chipotle cashew cream.', 'Wraps', 11.5],
      ['Dark Chocolate Chia Pudding', 'Cacao chia pudding with berries, toasted coconut, and maple.', 'Dessert', 7.5]
    ]
  ];
  const foods = [];
  for (let partnerIndex = 0; partnerIndex < partners.length; partnerIndex += 1) {
    for (let foodIndex = 0; foodIndex < 5; foodIndex += 1) {
      const [name, description, category, price] = menus[partnerIndex][foodIndex];
      foods.push({
        partner: partners[partnerIndex]._id,
        name,
        description,
        price,
        image: `${env.publicBaseUrl}/uploads/seed-food-${slugify(name)}.png`,
        category,
        tags: ['fresh', partnerIndex === 2 ? 'plant-based' : 'popular'],
        ratingAvg: 4 + ((foodIndex + partnerIndex) % 10) / 10,
        ratingCount: 2 + foodIndex,
        likeCount: 2 + foodIndex,
        saveCount: 1 + (foodIndex % 3),
        orderCount: 1 + foodIndex
      });
    }
  }
  const createdFoods = await Food.insertMany(foods);

  const reels = [];
  for (let partnerIndex = 0; partnerIndex < partners.length; partnerIndex += 1) {
    const partnerFoods = createdFoods.slice(partnerIndex * 5, partnerIndex * 5 + 5);
    reels.push(
      {
        partner: partners[partnerIndex]._id,
        food: partnerFoods[0]._id,
        video: `${env.publicBaseUrl}/uploads/seed-reel-${['spice', 'pasta', 'green'][partnerIndex]}.mp4`,
        thumbnail: `${env.publicBaseUrl}/uploads/seed-reel-${['spice', 'pasta', 'green'][partnerIndex]}.png`,
        caption: `Behind the scenes at ${partners[partnerIndex].business.name}`,
        views: 125 + partnerIndex * 80,
        likeCount: 4 + partnerIndex
      },
      {
        partner: partners[partnerIndex]._id,
        food: partnerFoods[1]._id,
        video: `${env.publicBaseUrl}/uploads/seed-reel-${['spice', 'pasta', 'green'][partnerIndex]}.mp4`,
        thumbnail: partnerFoods[1].image,
        caption: `Watch our ${partnerFoods[1].name} come together`,
        views: 90 + partnerIndex * 65,
        saveCount: 2 + partnerIndex
      }
    );
  }
  const createdReels = await Reel.insertMany(reels);

  const interactions = [];
  for (let index = 0; index < 6; index += 1) {
    interactions.push({
      user: customers[index % customers.length]._id,
      targetType: 'food',
      target: createdFoods[index]._id
    });
  }
  for (let index = 0; index < 6; index += 1) {
    interactions.push({
      user: customers[(index + 1) % customers.length]._id,
      targetType: 'reel',
      target: createdReels[index]._id
    });
  }
  await Like.insertMany(interactions.slice(0, 6));
  await Save.insertMany(interactions.slice(6));

  const statuses = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'placed', 'delivered', 'preparing', 'accepted', 'delivered', 'cancelled', 'placed', 'out_for_delivery', 'accepted'];
  const orders = [];
  for (let index = 0; index < 15; index += 1) {
    const food = createdFoods[index % createdFoods.length];
    const status = statuses[index % statuses.length];
    const createdAt = new Date(Date.now() - (index + 1) * 2 * 24 * 60 * 60 * 1000);
    orders.push({
      customer: customers[index % customers.length]._id,
      partner: food.partner,
      items: [{ food: food._id, name: food.name, price: food.price, quantity: 1 + (index % 2) }],
      subtotal: Math.round(food.price * (1 + (index % 2)) * 100) / 100,
      deliveryFee: 2.99,
      total: Math.round((food.price * (1 + (index % 2)) + 2.99) * 100) / 100,
      status,
      statusHistory: [{ status: 'placed', at: createdAt }, ...(status === 'placed' ? [] : [{ status, at: createdAt }])],
      address: `${index + 1} Demo Street`,
      createdAt,
      updatedAt: createdAt
    });
  }
  const createdOrders = await Order.insertMany(orders);
  const delivered = createdOrders.filter((order) => order.status === 'delivered');
  await Review.insertMany(
    delivered.map((order, index) => ({
      customer: order.customer,
      food: order.items[0].food,
      partner: order.partner,
      order: order._id,
      rating: 4 + (index % 2),
      comment: ['Delicious and fresh.', 'Great portion and flavour.'][index % 2]
    }))
  );

  await mongoose.connection.close();
  console.log('FoodSnap seed complete.');
  console.log('Demo password:', password);
  console.log('Customers: maya@example.com, liam@example.com, olivia@example.com');
  console.log('Partners: spice@example.com, pasta@example.com, green@example.com');
}

seed().catch(async (error) => {
  console.error('FoodSnap seed failed', error);
  await mongoose.connection.close();
  process.exitCode = 1;
});
