import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';

@Entity('orders_products')
class OrdersProducts {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  product_id: string;

  @ManyToOne(() => Product, product => product.order_products, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  order_id: string;

  @ManyToOne(() => Order, order => order.order_products, { eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default OrdersProducts;
