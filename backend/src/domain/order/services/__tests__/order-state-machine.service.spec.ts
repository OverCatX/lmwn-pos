import { OrderStateMachine } from '../order-state-machine.service';
import { OrderStatus } from '../../enums/order-status.enum';
import { Order } from '../../entities/order.entity';
import { InvalidOrderStateTransitionException } from '../../exceptions';
import { randomUUID } from 'crypto';

describe('OrderStateMachine', () => {
    let stateMachine: OrderStateMachine;

    beforeEach(() => {
        stateMachine = new OrderStateMachine();
    });

    describe('canTransition', () => {
        describe('PENDING state transitions', () => {
            it('should allow PENDING → CONFIRMED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED),
                ).toBe(true);
            });

            it('should allow PENDING → CANCELLED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED),
                ).toBe(true);
            });

            it('should not allow PENDING → PREPARING', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.PREPARING),
                ).toBe(false);
            });

            it('should not allow PENDING → READY', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.READY),
                ).toBe(false);
            });

            it('should not allow PENDING → COMPLETED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.COMPLETED),
                ).toBe(false);
            });

            it('should not allow PENDING → PENDING', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.PENDING),
                ).toBe(false);
            });
        });

        describe('CONFIRMED state transitions', () => {
            it('should allow CONFIRMED → PREPARING', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.PREPARING),
                ).toBe(true);
            });

            it('should allow CONFIRMED → CANCELLED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                ).toBe(true);
            });

            it('should not allow CONFIRMED → PENDING', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.PENDING),
                ).toBe(false);
            });

            it('should not allow CONFIRMED → READY', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.READY),
                ).toBe(false);
            });

            it('should not allow CONFIRMED → COMPLETED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.COMPLETED),
                ).toBe(false);
            });
        });

        describe('PREPARING state transitions', () => {
            it('should allow PREPARING → READY', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.READY),
                ).toBe(true);
            });

            it('should allow PREPARING → CANCELLED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED),
                ).toBe(true);
            });

            it('should not allow PREPARING → CONFIRMED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.CONFIRMED),
                ).toBe(false);
            });

            it('should not allow PREPARING → COMPLETED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.COMPLETED),
                ).toBe(false);
            });
        });

        describe('READY state transitions', () => {
            it('should allow READY → COMPLETED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.READY, OrderStatus.COMPLETED),
                ).toBe(true);
            });

            it('should allow READY → CANCELLED', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.READY, OrderStatus.CANCELLED),
                ).toBe(true);
            });

            it('should not allow READY → PREPARING', () => {
                expect(
                    stateMachine.canTransition(OrderStatus.READY, OrderStatus.PREPARING),
                ).toBe(false);
            });
        });

        describe('COMPLETED state transitions', () => {
            it('should not allow any transitions from COMPLETED', () => {
                const allStatuses = Object.values(OrderStatus);

                allStatuses.forEach((status) => {
                    expect(
                        stateMachine.canTransition(OrderStatus.COMPLETED, status),
                    ).toBe(false);
                });
            });
        });

        describe('CANCELLED state transitions', () => {
            it('should not allow any transitions from CANCELLED', () => {
                const allStatuses = Object.values(OrderStatus);

                allStatuses.forEach((status) => {
                    expect(
                        stateMachine.canTransition(OrderStatus.CANCELLED, status),
                    ).toBe(false);
                });
            });
        });
    });

    describe('validateTransition', () => {
        it('should validate successful transition', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.CONFIRMED);
            }).not.toThrow();
        });

        it('should throw when transitioning to same state', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PENDING);
            }).toThrow(InvalidOrderStateTransitionException);
        });

        it('should throw when transitioning from COMPLETED', () => {
            const order = Order.create(randomUUID(), 'staff-001');
            order.updateStatus(OrderStatus.CONFIRMED);
            order.updateStatus(OrderStatus.PREPARING);
            order.updateStatus(OrderStatus.READY);
            order.updateStatus(OrderStatus.COMPLETED);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PREPARING);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PREPARING);
            }).toThrow(/Cannot modify a completed order/);
        });

        it('should throw when transitioning from CANCELLED', () => {
            const order = Order.create(randomUUID(), 'staff-001');
            order.updateStatus(OrderStatus.CANCELLED);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.CONFIRMED);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.CONFIRMED);
            }).toThrow(/Cannot modify a cancelled order/);
        });

        it('should throw for invalid transition', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.COMPLETED);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.COMPLETED);
            }).toThrow(/Cannot transition order from PENDING to COMPLETED/);
        });
    });

    describe('getAllowedTransitions', () => {
        it('should return allowed transitions for PENDING', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.PENDING);

            expect(allowed).toContain(OrderStatus.CONFIRMED);
            expect(allowed).toContain(OrderStatus.CANCELLED);
            expect(allowed).toHaveLength(2);
        });

        it('should return allowed transitions for CONFIRMED', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.CONFIRMED);

            expect(allowed).toContain(OrderStatus.PREPARING);
            expect(allowed).toContain(OrderStatus.CANCELLED);
            expect(allowed).toHaveLength(2);
        });

        it('should return allowed transitions for PREPARING', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.PREPARING);

            expect(allowed).toContain(OrderStatus.READY);
            expect(allowed).toContain(OrderStatus.CANCELLED);
            expect(allowed).toHaveLength(2);
        });

        it('should return allowed transitions for READY', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.READY);

            expect(allowed).toContain(OrderStatus.COMPLETED);
            expect(allowed).toContain(OrderStatus.CANCELLED);
            expect(allowed).toHaveLength(2);
        });

        it('should return empty array for COMPLETED', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.COMPLETED);

            expect(allowed).toEqual([]);
        });

        it('should return empty array for CANCELLED', () => {
            const allowed = stateMachine.getAllowedTransitions(OrderStatus.CANCELLED);

            expect(allowed).toEqual([]);
        });
    });

    describe('isTerminalState', () => {
        it('should return true for COMPLETED', () => {
            expect(stateMachine.isTerminalState(OrderStatus.COMPLETED)).toBe(true);
        });

        it('should return true for CANCELLED', () => {
            expect(stateMachine.isTerminalState(OrderStatus.CANCELLED)).toBe(true);
        });

        it('should return false for non-terminal states', () => {
            expect(stateMachine.isTerminalState(OrderStatus.PENDING)).toBe(false);
            expect(stateMachine.isTerminalState(OrderStatus.CONFIRMED)).toBe(false);
            expect(stateMachine.isTerminalState(OrderStatus.PREPARING)).toBe(false);
            expect(stateMachine.isTerminalState(OrderStatus.READY)).toBe(false);
        });
    });

    describe('isValidStatus', () => {
        it('should return true for valid status strings', () => {
            expect(stateMachine.isValidStatus('PENDING')).toBe(true);
            expect(stateMachine.isValidStatus('CONFIRMED')).toBe(true);
            expect(stateMachine.isValidStatus('PREPARING')).toBe(true);
            expect(stateMachine.isValidStatus('READY')).toBe(true);
            expect(stateMachine.isValidStatus('COMPLETED')).toBe(true);
            expect(stateMachine.isValidStatus('CANCELLED')).toBe(true);
        });

        it('should return false for invalid status strings', () => {
            expect(stateMachine.isValidStatus('INVALID')).toBe(false);
            expect(stateMachine.isValidStatus('pending')).toBe(false);
            expect(stateMachine.isValidStatus('')).toBe(false);
            expect(stateMachine.isValidStatus('PROCESSING')).toBe(false);
        });
    });

    describe('Real-world scenarios', () => {
        it('should allow complete order flow: PENDING → CONFIRMED → PREPARING → READY → COMPLETED', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            stateMachine.validateTransition(order, OrderStatus.CONFIRMED);
            order.updateStatus(OrderStatus.CONFIRMED);

            stateMachine.validateTransition(order, OrderStatus.PREPARING);
            order.updateStatus(OrderStatus.PREPARING);

            stateMachine.validateTransition(order, OrderStatus.READY);
            order.updateStatus(OrderStatus.READY);

            stateMachine.validateTransition(order, OrderStatus.COMPLETED);
            order.updateStatus(OrderStatus.COMPLETED);

            expect(order.getStatus()).toBe(OrderStatus.COMPLETED);
        });

        it('should allow cancellation at any non-terminal state', () => {
            const orderAtPending = Order.create(randomUUID(), 'staff-001');
            expect(() => {
                stateMachine.validateTransition(orderAtPending, OrderStatus.CANCELLED);
            }).not.toThrow();

            const orderAtConfirmed = Order.create(randomUUID(), 'staff-001');
            orderAtConfirmed.updateStatus(OrderStatus.CONFIRMED);
            expect(() => {
                stateMachine.validateTransition(orderAtConfirmed, OrderStatus.CANCELLED);
            }).not.toThrow();

            const orderAtPreparing = Order.create(randomUUID(), 'staff-001');
            orderAtPreparing.updateStatus(OrderStatus.CONFIRMED);
            orderAtPreparing.updateStatus(OrderStatus.PREPARING);
            expect(() => {
                stateMachine.validateTransition(orderAtPreparing, OrderStatus.CANCELLED);
            }).not.toThrow();

            const orderAtReady = Order.create(randomUUID(), 'staff-001');
            orderAtReady.updateStatus(OrderStatus.CONFIRMED);
            orderAtReady.updateStatus(OrderStatus.PREPARING);
            orderAtReady.updateStatus(OrderStatus.READY);
            expect(() => {
                stateMachine.validateTransition(orderAtReady, OrderStatus.CANCELLED);
            }).not.toThrow();
        });

        it('should prevent skipping states', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PREPARING);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.READY);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.COMPLETED);
            }).toThrow(InvalidOrderStateTransitionException);
        });

        it('should prevent backward transitions', () => {
            const order = Order.create(randomUUID(), 'staff-001');
            order.updateStatus(OrderStatus.CONFIRMED);
            order.updateStatus(OrderStatus.PREPARING);
            order.updateStatus(OrderStatus.READY);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PREPARING);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.CONFIRMED);
            }).toThrow(InvalidOrderStateTransitionException);

            expect(() => {
                stateMachine.validateTransition(order, OrderStatus.PENDING);
            }).toThrow(InvalidOrderStateTransitionException);
        });

        it('should allow getting next available actions for UI', () => {
            const order = Order.create(randomUUID(), 'staff-001');

            const pendingActions = stateMachine.getAllowedTransitions(order.getStatus());
            expect(pendingActions).toEqual([OrderStatus.CONFIRMED, OrderStatus.CANCELLED]);

            order.updateStatus(OrderStatus.CONFIRMED);
            const confirmedActions = stateMachine.getAllowedTransitions(order.getStatus());
            expect(confirmedActions).toEqual([OrderStatus.PREPARING, OrderStatus.CANCELLED]);

            order.updateStatus(OrderStatus.PREPARING);
            const preparingActions = stateMachine.getAllowedTransitions(order.getStatus());
            expect(preparingActions).toEqual([OrderStatus.READY, OrderStatus.CANCELLED]);

            order.updateStatus(OrderStatus.READY);
            const readyActions = stateMachine.getAllowedTransitions(order.getStatus());
            expect(readyActions).toEqual([OrderStatus.COMPLETED, OrderStatus.CANCELLED]);

            order.updateStatus(OrderStatus.COMPLETED);
            const completedActions = stateMachine.getAllowedTransitions(order.getStatus());
            expect(completedActions).toEqual([]);
        });
    });
});
