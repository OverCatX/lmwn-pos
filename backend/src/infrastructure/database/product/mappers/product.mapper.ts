import { Product } from '../../../../domain/product';
import { Money } from '../../../../domain/shared';
import { ProductOrmEntity } from '../entities/product.orm.entity';

/**
 * Product Mapper
 * Converts between Product domain entity and ProductOrmEntity
 */
export class ProductMapper {
    /**
     * Convert ORM entity to domain entity
     * @param orm - Product ORM entity
     * @returns Product domain entity
     */
    static toDomain(orm: ProductOrmEntity): Product {
        const price = Money.from(orm.price, orm.currency);

        return new Product(
            orm.id,
            orm.name,
            price,
            orm.category,
            orm.isActive,
            orm.createdAt,
        );
    }

    /**
     * Convert domain entity to ORM entity
     * @param domain - Product domain entity
     * @returns Product ORM entity
     */
    static toOrm(domain: Product): ProductOrmEntity {
        const orm = new ProductOrmEntity();

        orm.id = domain.getId();
        orm.name = domain.getName();
        orm.price = domain.getPrice().toNumber().toFixed(2);
        orm.currency = domain.getPrice().getCurrency();
        orm.category = domain.getCategory();
        orm.isActive = domain.getIsActive();

        return orm;
    }

    /**
     * Convert domain entity to partial ORM entity (for updates)
     * @param domain - Product domain entity
     * @returns Partial Product ORM entity
     */
    static toOrmPartial(domain: Product): Partial<ProductOrmEntity> {
        return {
            name: domain.getName(),
            price: domain.getPrice().toNumber().toFixed(2),
            currency: domain.getPrice().getCurrency(),
            category: domain.getCategory(),
            isActive: domain.getIsActive(),
        };
    }

    /**
     * Convert array of ORM entities to domain entities
     * @param ormList - Array of Product ORM entities
     * @returns Array of Product domain entities
     */
    static toDomainList(ormList: ProductOrmEntity[]): Product[] {
        return ormList.map((orm) => this.toDomain(orm));
    }
}
