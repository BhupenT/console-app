import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import {Products} from './products.types';

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService) {}
    @Get()
    getProducts(): Products {
        return this.productService.getProducts()
    }

    @Get(':id')
    getProduct(@Param('id') id): {info: string, id: number} {
        return this.productService.getProduct(id);
    }
}
