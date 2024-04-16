import { Token, currencyEquals } from "./token";
import { Currency } from "./currency";
import { formatUnits } from "viem";
import { enforce } from "../utils/invariant";
import Decimal from "decimal.js-light";

export type TokenOrCurrency = Token | Currency;

export class Amount<T extends TokenOrCurrency> extends Decimal {
    public readonly currency: T;
    public readonly raw: bigint;

    public constructor(currency: T, amount: bigint) {
        super(new Decimal(formatUnits(amount, currency.decimals)));
        this.currency = currency;
        this.raw = amount;
    }

    public plus(other: Amount<TokenOrCurrency>): Amount<T> {
        enforce(
            currencyEquals(this.currency, other.currency),
            "tried to sum different currencies",
        );
        return new Amount<T>(this.currency, this.raw + other.raw);
    }

    public minus(other: Amount<T>): Amount<T> {
        enforce(
            currencyEquals(this.currency, other.currency),
            "tried to subtract different currencies",
        );
        enforce(
            this.greaterThan(other),
            "subtraction results in a negative amount",
        );
        return new Amount<T>(this.currency, this.raw - other.raw);
    }

    public multiply<M extends TokenOrCurrency>(other: Amount<M>): Amount<M> {
        return new Amount<M>(
            other.currency,
            BigInt(
                this.times(other)
                    .times(`1e${other.currency.decimals}`)
                    .toFixed(0),
            ),
        );
    }

    public divide<M extends TokenOrCurrency>(other: Amount<M>): Amount<M> {
        return new Amount<M>(
            other.currency,
            BigInt(
                this.dividedBy(other)
                    .times(`1e${other.currency.decimals}`)
                    .toFixed(0),
            ),
        );
    }
}
