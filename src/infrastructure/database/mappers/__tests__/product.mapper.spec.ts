import { Product } from "src/domain/entities/product.entity";
import { Money } from "src/domain/value-objects/money.vo";
import { ProductOrmEntity } from "../../entities";
import { ProductMapper } from "../product.mapper";


describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('should convert ORM entity to domain entity', () => {
      const orm = new ProductOrmEntity();
      orm.id = 'p1';
      orm.name = 'Test Product';
      orm.price = '99.99';
      orm.currency = 'THB';
      orm.category = 'FOOD';
      orm.isActive = true;
      orm.createdAt = new Date('2024-01-01');

      const domain = ProductMapper.toDomain(orm);

      expect(domain.getId()).toBe('p1');
      expect(domain.getName()).toBe('Test Product');
      expect(domain.getPrice().toNumber()).toBe(99.99);
      expect(domain.getPrice().getCurrency()).toBe('THB');
      expect(domain.getCategory()).toBe('FOOD');
      expect(domain.getIsActive()).toBe(true);
    });
  });

  describe('toOrm', () => {
    it('should convert domain entity to ORM entity', () => {
      const domain = new Product(
        'p1',
        'Test Product',
        Money.from(99.99, 'THB'),
        'FOOD',
        true,
      );

      const orm = ProductMapper.toOrm(domain);

      expect(orm.id).toBe('p1');
      expect(orm.name).toBe('Test Product');
      expect(orm.price).toBe('99.99');
      expect(orm.currency).toBe('THB');
      expect(orm.category).toBe('FOOD');
      expect(orm.isActive).toBe(true);
    });

    it('should format price to 2 decimal places', () => {
      const domain = new Product(
        'p1',
        'Test Product',
        Money.from(99.999, 'THB'),
        'FOOD',
      );

      const orm = ProductMapper.toOrm(domain);

      expect(orm.price).toBe('100.00');
    });
  });

  describe('toOrmPartial', () => {
    it('should convert domain entity to partial ORM entity', () => {
      const domain = new Product(
        'p1',
        'Updated Product',
        Money.from(150, 'THB'),
        'BEVERAGE',
        false,
      );

      const partial = ProductMapper.toOrmPartial(domain);

      expect(partial.id).toBeUndefined(); // ID not included in partial
      expect(partial.name).toBe('Updated Product');
      expect(partial.price).toBe('150.00');
      expect(partial.currency).toBe('THB');
      expect(partial.category).toBe('BEVERAGE');
      expect(partial.isActive).toBe(false);
    });
  });

  describe('toDomainList', () => {
    it('should convert array of ORM entities to domain entities', () => {
      const orm1 = new ProductOrmEntity();
      orm1.id = 'p1';
      orm1.name = 'Product 1';
      orm1.price = '10.00';
      orm1.currency = 'THB';
      orm1.category = 'FOOD';
      orm1.isActive = true;
      orm1.createdAt = new Date();

      const orm2 = new ProductOrmEntity();
      orm2.id = 'p2';
      orm2.name = 'Product 2';
      orm2.price = '20.00';
      orm2.currency = 'THB';
      orm2.category = 'BEVERAGE';
      orm2.isActive = true;
      orm2.createdAt = new Date();

      const domainList = ProductMapper.toDomainList([orm1, orm2]);

      expect(domainList).toHaveLength(2);
      expect(domainList[0].getId()).toBe('p1');
      expect(domainList[1].getId()).toBe('p2');
    });
  });
});
