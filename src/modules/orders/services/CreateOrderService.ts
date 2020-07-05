import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomer = await this.customersRepository.findById(customer_id);

    if (!checkCustomer) {
      throw new AppError('Customer not found');
    }

    let productsIds = products.map(product => ({
      id: product.id,
    }));

    const checkProducts = await this.productsRepository.findAllById(productsIds);

    if (checkProducts.length !== products.length) {
      throw new AppError('Product(s) not found');
    }

    let searchProduct: any;

    products.forEach(product => {
      searchProduct = checkProducts
        .find(search => search.id === product.id);

      if (searchProduct && searchProduct.quantity < product.quantity) {
        throw new AppError('Exceded limit quantity.');
      }
    });

    const formattedProducts = products.map(product => ({
      product_id: product.id,
      price: searchProduct.price || 0,
      quantity: product.quantity,
    }))

    const order = await this.ordersRepository.create({
      customer: checkCustomer,
      products: formattedProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
